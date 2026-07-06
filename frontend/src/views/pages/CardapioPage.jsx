import { useState, useEffect } from 'react';
import { produtoService } from '../../services';
import { Cartao, Carregando, EstadoVazio, Badge } from '../components';
import { formatarMoeda } from '../../utils/formatadores';
import estilos from './Paginas.module.css';

export default function CardapioPage() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    produtoService
      .cardapio()
      .then((r) => setProdutos(r.data ?? r ?? []))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <Carregando texto="Carregando cardápio..." />;

  const porCategoria = produtos.reduce((acc, p) => {
    const cat = p.categoria || 'Outros';
    (acc[cat] = acc[cat] || []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="titulo-pagina">🥤 Cardápio</h1>
      <p className="subtitulo-pagina">Bebidas, lanches e pratos disponíveis na arena.</p>

      {produtos.length === 0 ? (
        <EstadoVazio icone="🍹" mensagem="Nenhum item disponível no cardápio agora." />
      ) : (
        Object.entries(porCategoria).map(([categoria, itens]) => (
          <section key={categoria} className={estilos.secao}>
            <h2 className={estilos.secaoTitulo}>{categoria}</h2>
            <div className="grade">
              {itens.map((p) => (
                <Cartao key={p.id}>
                  <div className="flex justify-between items-center">
                    <h3 className={estilos.itemTitulo}>{p.nome}</h3>
                    {p.quantidade <= p.estoque_minimo && <Badge tom="alerta">Últimas unidades</Badge>}
                  </div>
                  {p.descricao && <p className={estilos.itemDado}>{p.descricao}</p>}
                  <div className={estilos.itemPreco}>{formatarMoeda(p.preco_venda)}</div>
                </Cartao>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
