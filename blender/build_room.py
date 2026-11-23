"""Monta a sala de trabalho do portfólio no Blender (rodar pela ponte ou no editor de texto).

Cria/recria a cena "Sala". Coordenadas escritas no sistema do site (three.js, Y para cima)
e convertidas para o Blender (Z para cima): (x, y, z)_three -> (x, -z, y)_blender.
Nomes exigidos pelo site: monitor_tela, estante, celular, porta_retrato, cam_<secao>, alvo_<secao>.
"""
import math
import os

import bpy
from mathutils import Vector

REPO = os.environ.get('PORTFOLIO_REPO', r'G:\Meu Drive\Desenvolvimento\portfolio')
FOTO = os.path.join(REPO, 'public', 'img', 'eu.jpg')

SKILLS = [('Front-end', '#5b9cff'), ('Back-end', '#a77bff'), ('Dados', '#2ed3a0'), ('Mobile e 3D', '#ffb347'), ('DevOps', '#ff7a8a')]

POSES = {  # mesmas poses da sala provisória (three.js)
    'inicio': ((2.6, 1.75, 2.9), (-0.6, 0.9, -1.0)),
    'projetos': ((0.5, 1.12, 0.35), (0.5, 1.06, -1.2)),
    'habilidades': ((1.1, 1.25, -0.2), (-2.2, 0.95, -0.95)),
    'sobre': ((-0.05, 1.05, -0.25), (-0.32, 0.86, -1.1)),
    'contato': ((0.05, 1.12, -0.15), (0.38, 0.8, -0.85)),
}


def P(x, y, z):
    return Vector((x, -z, y))


def hexrgb(h, a=1.0):
    h = h.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, a)


_mats = {}


def principled(m):
    nt = m.node_tree
    b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if b is None:
        b = nt.nodes.new('ShaderNodeBsdfPrincipled')
        out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None) or nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(b.outputs['BSDF'], out.inputs['Surface'])
    return b


def mat(name, color, rough=0.7, metal=0.0, emit=None, strength=0.0):
    key = (name, color, emit)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = principled(m)
    b.inputs['Base Color'].default_value = hexrgb(color)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = hexrgb(emit)
        b.inputs['Emission Strength'].default_value = strength
    _mats[key] = m
    return m


def box(name, size, pos, material, bevel=0.0, rot=(0, 0, 0)):
    """size e pos no sistema three.js (largura x, altura y, profundidade z)."""
    w, h, d = size
    bpy.ops.mesh.primitive_cube_add(size=1, location=P(*pos))
    o = bpy.context.active_object
    o.name = name
    o.scale = (w, d, h)
    o.rotation_euler = rot
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new('bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'
    o.data.materials.append(material)
    return o


def cyl(name, r, h, pos, material, verts=24, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=P(*pos))
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, vertices=verts, location=P(*pos))
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(material)
    return o


def join(name, objs):
    for o in objs:
        for mod in o.modifiers:
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.active_object
    o.name = name
    return o


def empty(name, pos):
    e = bpy.data.objects.new(name, None)
    e.location = P(*pos)
    e.empty_display_size = 0.05
    bpy.context.scene.collection.objects.link(e)
    return e


def build():
    # cena nova, sem tocar nas outras cenas do arquivo
    old = bpy.data.scenes.get('Sala')
    if old:
        bpy.data.scenes.remove(old)
    scene = bpy.data.scenes.new('Sala')
    bpy.context.window.scene = scene
    for o in list(bpy.data.objects):
        if not o.users_scene:
            bpy.data.objects.remove(o)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.images, bpy.data.worlds):
        for item in list(coll):
            if item.users == 0:
                coll.remove(item)
    _mats.clear()

    # mundo: noite azulada fraca
    world = bpy.data.worlds.new('Noite')
    world.use_nodes = True
    nt = world.node_tree
    bg = next((n for n in nt.nodes if n.type == 'BACKGROUND'), None) or nt.nodes.new('ShaderNodeBackground')
    out = next((n for n in nt.nodes if n.type == 'OUTPUT_WORLD'), None) or nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])
    bg.inputs['Color'].default_value = hexrgb('#0f1626')
    bg.inputs['Strength'].default_value = 1.1
    scene.world = world

    madeira = mat('madeira', '#8a5f3c', 0.55)
    madeira_esc = mat('madeira_escura', '#5a3d27', 0.6)
    metal = mat('metal', '#2b313d', 0.35, 0.6)
    plast = mat('plastico', '#1c212b', 0.4)
    parede = mat('parede', '#24304a', 0.9)
    parede2 = mat('parede_lateral', '#1f2940', 0.9)
    piso = mat('piso', '#3b2f2b', 0.75)
    tapete = mat('tapete', '#2d3a5c', 1.0)
    tecido = mat('tecido', '#323a4d', 0.95)
    papel = mat('moldura', '#efe6d6', 0.6)
    vaso = mat('vaso', '#b0603c', 0.6)
    folha = mat('folha', '#3f8f5f', 0.7)
    caneca = mat('caneca', '#e8e2d6', 0.3)

    # sala
    chao = box('chao', (6, 0.05, 5), (0, -0.025, 0), piso)
    tap = box('tapete', (1.6, 0.012, 1.2), (0.1, 0.006, -0.35), tapete, bevel=0.004)
    fundo = box('parede_fundo', (6, 3, 0.05), (0, 1.5, -1.65), parede)
    lateral = box('parede_lateral', (0.05, 3, 5), (-2.25, 1.5, 0), parede2)
    rodape = box('rodape', (6, 0.08, 0.02), (0, 0.04, -1.62), madeira_esc)
    paredes = join('paredes', [fundo, lateral, rodape])

    # janela com céu noturno
    jan_vidro = box('janela_vidro', (0.9, 0.7, 0.01), (1.35, 1.75, -1.62), mat('ceu', '#14284d', 1.0, emit='#22406f', strength=0.45))
    jan_mold = [box('jm1', (1.0, 0.05, 0.05), (1.35, 2.12, -1.6), madeira_esc), box('jm2', (1.0, 0.05, 0.05), (1.35, 1.38, -1.6), madeira_esc),
                box('jm3', (0.05, 0.8, 0.05), (0.88, 1.75, -1.6), madeira_esc), box('jm4', (0.05, 0.8, 0.05), (1.82, 1.75, -1.6), madeira_esc),
                box('jm5', (0.03, 0.7, 0.03), (1.35, 1.75, -1.6), madeira_esc)]
    join('janela_moldura', jan_mold)

    # mesa
    tampo = box('tampo', (1.7, 0.05, 0.75), (0, 0.74, -1.05), madeira, bevel=0.01)
    pernas = [box(f'perna{i}', (0.05, 0.72, 0.05), (x, 0.36, z), metal) for i, (x, z) in enumerate([(-0.8, -0.72), (0.8, -0.72), (-0.8, -1.38), (0.8, -1.38)])]
    gaveta = box('gaveteiro', (0.4, 0.45, 0.6), (0.55, 0.47, -1.05), madeira_esc, bevel=0.01)
    join('mesa', [tampo, gaveta] + pernas)

    # monitor
    base = cyl('mon_base', 0.12, 0.015, (0, 0.772, -1.28), metal, 32)
    haste = box('mon_haste', (0.05, 0.32, 0.04), (0, 0.93, -1.32), metal)
    corpo = box('mon_corpo', (0.98, 0.58, 0.035), (0, 1.12, -1.33), plast, bevel=0.008)
    join('monitor', [corpo, base, haste])
    bpy.ops.mesh.primitive_plane_add(size=1, location=P(0, 1.12, -1.31))
    tela = bpy.context.active_object
    tela.name = 'monitor_tela'
    tela.scale = (0.92, 0.52, 1)
    tela.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    tela.data.materials.append(mat('tela', '#7fb2ff', 0.3, emit='#7fb2ff', strength=2.5))

    # teclado, mouse, caneca
    tecl = box('teclado', (0.46, 0.018, 0.15), (-0.05, 0.775, -0.88), plast, bevel=0.004)
    teclas = box('teclas', (0.42, 0.006, 0.12), (-0.05, 0.787, -0.88), mat('teclas', '#3a4252', 0.5))
    mouse = box('mouse', (0.06, 0.025, 0.1), (0.3, 0.778, -0.86), plast, bevel=0.012)
    cn = cyl('caneca', 0.04, 0.1, (-0.62, 0.815, -0.85), caneca)
    join('acessorios', [tecl, teclas, mouse, cn])

    # celular (com tela separada, que acende em Contato)
    cel = box('celular', (0.08, 0.012, 0.16), (0.5, 0.772, -0.85), plast, bevel=0.006, rot=(0, 0, math.radians(17)))
    bpy.ops.mesh.primitive_plane_add(size=1, location=P(0.5, 0.7785, -0.85))
    ct = bpy.context.active_object
    ct.name = 'celular_tela'
    ct.scale = (0.07, 0.145, 1)
    ct.rotation_euler = (0, 0, math.radians(17))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    ct.data.materials.append(mat('tela_celular', '#2ed3a0', 0.3, emit='#2ed3a0', strength=0.4))
    ct.parent = cel
    ct.matrix_parent_inverse = cel.matrix_world.inverted()

    # porta-retrato com a foto
    moldura = box('moldura', (0.17, 0.21, 0.02), (-0.5, 0.88, -1.15), papel, bevel=0.004)
    bpy.ops.mesh.primitive_plane_add(size=1, location=P(-0.5, 0.88, -1.139))
    foto = bpy.context.active_object
    foto.scale = (0.13, 0.17, 1)
    foto.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    fm = bpy.data.materials.new('foto')
    fm.use_nodes = True
    tex = fm.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(FOTO, check_existing=True)
    fb = principled(fm)
    fm.node_tree.links.new(tex.outputs['Color'], fb.inputs['Base Color'])
    fb.inputs['Roughness'].default_value = 0.4
    foto.data.materials.append(fm)
    pe = box('pe_moldura', (0.03, 0.15, 0.02), (-0.5, 0.85, -1.18), papel, rot=(math.radians(-25), 0, 0))
    pr = join('porta_retrato', [moldura, foto, pe])
    pr.rotation_euler = (0, 0, math.radians(-20))

    # luminária
    lb = cyl('lum_base', 0.07, 0.02, (0.72, 0.775, -1.22), metal, 32)
    la = box('lum_braco', (0.018, 0.42, 0.018), (0.72, 0.98, -1.22), metal)
    lb2 = box('lum_braco2', (0.018, 0.018, 0.2), (0.72, 1.19, -1.13), metal)
    join('luminaria', [lb, la, lb2])
    cupula = cyl('cupula', 0.09, 0.12, (0.72, 1.15, -1.03), mat('cupula', '#f2b35b', 0.5, emit='#f2b35b', strength=3.0), 32, r2=0.035)
    cupula.rotation_euler = (math.radians(-35), 0, 0)

    # estante: um grupo de livros por área de habilidade
    partes = [box('est_lado_e', (0.03, 1.9, 0.5), (-1.9, 0.95, -1.4), madeira_esc), box('est_lado_d', (0.03, 1.9, 0.5), (-1.9, 0.95, -0.9), madeira_esc),
              box('est_fundo', (0.02, 1.9, 0.52), (-2.12, 0.95, -1.15), madeira_esc)]
    for i in range(6):
        partes.append(box(f'prat{i}', (0.46, 0.025, 0.5), (-1.9, 0.02 + i * 0.36, -1.15), madeira))
    for i, (_, cor) in enumerate(SKILLS):
        y0 = 0.035 + i * 0.36
        livro = mat(f'livro_{i}', cor, 0.6)
        livro2 = mat(f'livro_{i}b', cor, 0.8)
        for j, (dz, h) in enumerate([(-0.17, 0.27), (-0.11, 0.24), (-0.05, 0.29), (0.01, 0.22), (0.07, 0.26)]):
            partes.append(box(f'livro{i}{j}', (0.3, h, 0.05), (-1.95, y0 + h / 2, -1.15 + dz), livro if j % 2 == 0 else livro2, bevel=0.003))
    join('estante', partes)

    # cadeira
    assento = box('assento', (0.48, 0.07, 0.46), (0.05, 0.48, -0.32), tecido, bevel=0.02)
    encosto = box('encosto', (0.46, 0.55, 0.06), (0.05, 0.82, -0.08), tecido, bevel=0.02, rot=(math.radians(8), 0, 0))
    poste = cyl('poste', 0.025, 0.4, (0.05, 0.25, -0.32), metal)
    pes = [box(f'pe{i}', (0.32, 0.03, 0.04), (0.05, 0.04, -0.32), metal, rot=(0, 0, math.radians(i * 72))) for i in range(5)]
    join('cadeira', [assento, encosto, poste] + pes)

    # planta
    v = cyl('vaso', 0.15, 0.32, (1.6, 0.16, -1.3), vaso, 24, r2=0.12)
    folhas = []
    for k, (dx, dy, dz, r) in enumerate([(0, 0.55, 0, 0.2), (0.12, 0.7, 0.05, 0.15), (-0.1, 0.68, -0.06, 0.16), (0.02, 0.85, 0.02, 0.12)]):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=r, location=P(1.6 + dx, dy, -1.3 + dz))
        f = bpy.context.active_object
        f.data.materials.append(folha)
        folhas.append(f)
    join('planta', [v] + folhas)

    # luzes para o bake (não vão para o site)
    bpy.ops.object.light_add(type='POINT', location=P(0.72, 1.1, -1.0))
    l1 = bpy.context.active_object
    l1.name = 'luz_luminaria'
    l1.data.energy = 45
    l1.data.color = hexrgb('#ffc27a')[:3]
    l1.data.shadow_soft_size = 0.05
    bpy.ops.object.light_add(type='AREA', location=P(0, 1.12, -1.1))
    l2 = bpy.context.active_object
    l2.name = 'luz_monitor'
    l2.data.energy = 12
    l2.data.color = hexrgb('#8fbaff')[:3]
    l2.data.size = 0.9
    l2.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.light_add(type='AREA', location=P(1.35, 1.75, -1.2))
    l3 = bpy.context.active_object
    l3.name = 'luz_janela'
    l3.data.energy = 25
    l3.data.color = hexrgb('#6f8fd6')[:3]
    l3.data.size = 0.9
    l3.rotation_euler = (math.radians(90), 0, 0)

    bpy.ops.object.light_add(type='AREA', location=P(1.2, 2.6, 1.2))
    l4 = bpy.context.active_object
    l4.name = 'luz_preenchimento'
    l4.data.energy = 60
    l4.data.color = hexrgb('#7d8fc0')[:3]
    l4.data.size = 2.5
    l4.rotation_euler = (math.radians(35), 0, math.radians(40))

    # câmeras do site
    for sec, (pos, alvo) in POSES.items():
        empty(f'cam_{sec}', pos)
        empty(f'alvo_{sec}', alvo)

    # câmera de render (vista do início) para conferência
    cam_data = bpy.data.cameras.new('render_cam')
    cam_data.lens_unit = 'FOV'
    cam_data.angle = math.radians(60)
    cam = bpy.data.objects.new('render_cam', cam_data)
    scene.collection.objects.link(cam)
    cam.location = P(*POSES['inicio'][0])
    direction = P(*POSES['inicio'][1]) - cam.location
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam

    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 48
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.view_settings.view_transform = 'AgX'
    return sorted(o.name for o in scene.objects)


result = build()
