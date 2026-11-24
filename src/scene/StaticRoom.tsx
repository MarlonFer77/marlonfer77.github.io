/** Imagem da sala no lugar da cena 3D (sem WebGL ou com movimento reduzido). */
export function StaticRoom() {
  return (
    <div className="scene scene--static" aria-hidden="true" data-testid="static-room">
      <img src="img/sala-estatica.webp" alt="" />
    </div>
  )
}
