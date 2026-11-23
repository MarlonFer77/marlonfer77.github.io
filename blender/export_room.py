"""Bake de luz, export do GLB e render estático da cena "Sala".

Rodar pela ponte em etapas (cada chamada tem limite de tempo):
  ETAPA = 'bake:<objeto>'  -> faz o bake de um objeto
  ETAPA = 'lista'          -> devolve os objetos que precisam de bake
  ETAPA = 'export'         -> exporta public/models/sala.glb
  ETAPA = 'render'         -> renderiza a vista do início em PNG (convertida para WebP fora do Blender)
Defina ETAPA antes deste código (a ponte executa o texto inteiro).
"""
import os

import bpy

REPO = os.environ.get('PORTFOLIO_REPO', r'G:\Meu Drive\Desenvolvimento\portfolio')
SEM_BAKE = {'monitor_tela', 'celular_tela', 'cupula', 'janela_vidro'}  # materiais emissivos ficam como estão
GRANDES = {'paredes', 'chao', 'mesa', 'estante'}
AMOSTRAS = 32

scene = bpy.data.scenes['Sala']


def alvos():
    return [o.name for o in scene.objects if o.type == 'MESH' and o.name not in SEM_BAKE]


def bake(nome):
    o = scene.objects[nome]
    res = 1024 if nome in GRANDES else 512
    for other in scene.objects:
        other.select_set(False)
    bpy.context.window.scene = scene
    bpy.context.view_layer.objects.active = o
    o.select_set(True)

    # UV própria para o bake
    if 'bake' not in o.data.uv_layers:
        o.data.uv_layers.new(name='bake')
    o.data.uv_layers.active = o.data.uv_layers['bake']
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.02)
    bpy.ops.object.mode_set(mode='OBJECT')

    img = bpy.data.images.get(f'bake_{nome}') or bpy.data.images.new(f'bake_{nome}', res, res)
    # materiais exclusivos deste objeto, com o nó da imagem ativo
    for slot in o.material_slots:
        if slot.material.users > 1:
            slot.material = slot.material.copy()
        nt = slot.material.node_tree
        node = nt.nodes.get('bake_target') or nt.nodes.new('ShaderNodeTexImage')
        node.name = 'bake_target'
        node.image = img
        nt.nodes.active = node

    scene.render.engine = 'CYCLES'
    scene.cycles.samples = AMOSTRAS
    scene.render.bake.use_pass_direct = True
    scene.render.bake.use_pass_indirect = True
    scene.render.bake.margin = 4
    bpy.ops.object.bake(type='COMBINED', uv_layer='bake')

    # troca por um material simples com a luz já gravada
    m = bpy.data.materials.new(f'baked_{nome}')
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    tex = nt.nodes.new('ShaderNodeTexImage')
    uv = nt.nodes.new('ShaderNodeUVMap')
    uv.uv_map = 'bake'
    tex.image = img
    nt.links.new(uv.outputs['UV'], tex.inputs['Vector'])
    nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 1.0
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    o.data.materials.clear()
    o.data.materials.append(m)
    # só a UV do bake vai para o GLB
    for uvl in list(o.data.uv_layers):
        if uvl.name != 'bake':
            o.data.uv_layers.remove(uvl)
    return f'{nome}: {res}px'


def export():
    path = os.path.join(REPO, 'public', 'models', 'sala.glb')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.context.window.scene = scene
    for o in scene.objects:
        o.select_set(o.type in {'MESH', 'EMPTY'})
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB', use_selection=True,
        export_image_format='WEBP', export_image_quality=80,
        export_lights=False, export_cameras=False, export_apply=True,
        export_materials='EXPORT', export_yup=True,
    )
    return f'{path}: {os.path.getsize(path) // 1024} KB'


def render(out_png):
    bpy.context.window.scene = scene
    scene.cycles.samples = 64
    scene.render.resolution_x, scene.render.resolution_y = 1600, 1000
    scene.render.resolution_percentage = 100
    scene.render.filepath = out_png
    bpy.ops.render.render(write_still=True, scene='Sala')
    return out_png


etapa = globals().get('ETAPA', 'lista')
if etapa == 'lista':
    result = alvos()
elif etapa.startswith('bake:'):
    result = bake(etapa.split(':', 1)[1])
elif etapa == 'export':
    result = export()
elif etapa.startswith('render:'):
    result = render(etapa.split(':', 1)[1])
