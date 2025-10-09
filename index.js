
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const { Knex } = require('knex');
const knex = require('./database/database');
const base64 = require('base-64');
const uniqid = require('uniqid'); 
const uid2 = require('uid2');
const path = require('path');
const cors = require('cors');


require('dotenv').config();
app.use(cors());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

const title = 'IBADEJUF EAD'
const title_adm = ""

app.get('/admin', (req,res)=>{ 

        res.render('admin')    
    
    
})

app.get('/', (req,res)=>{ 

    knex('tb_produto')
	//.leftJoin('tb_imagens','tb_imagens.id_produto','tb_produto.id')
	.select()
    //.where({pagina_principal: 1})
    .limit(4)
	.then(produtos=>{
        //console.log(produtos);
		
		produtos.forEach(prods=> {
			//console.log(prods.imagem_principal)
		})
		
        res.render('index',{
            produtos: produtos
        })    
    })
    
	//res.render('index')
})


app.get('/brindes', (req,res)=>{ 

    knex('tb_produto')
	//.leftJoin('tb_imagens','tb_imagens.id_produto','tb_produto.id')
	.select()
    .where({categoria: 'brindes'})
    .limit(4)
	.then(produtos=>{
        //console.log(produtos);
		
		produtos.forEach(prods=> {
			//console.log(prods.imagem_principal)
		})
		
        res.render('brindes',{
            produtos: produtos
        })    
    })
    
	//res.render('index')
})


app.get('/grafica', (req,res)=>{ 

    knex('tb_produto')
	//.leftJoin('tb_imagens','tb_imagens.id_produto','tb_produto.id')
	.select()
    .where({categoria: 'grafica'})
    .limit(4)
	.then(produtos=>{
        //console.log(produtos);
		
		produtos.forEach(prods=> {
			//console.log(prods.imagem_principal)
		})
		
        res.render('grafica',{
            produtos: produtos
        })    
    })
    
	//res.render('index')
})

app.get('/admin', (req,res)=>{ 

        res.render('/admin')
    
	//res.render('index')
})



app.get('/produto/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Busca o produto pelo ID
        const produto = await knex('tb_produto').where({ id }).first();

        if (!produto) {
            return res.status(404).send('Produto não encontrado');
        }

        // Busca as imagens relacionadas ao produto
        const imagens = await knex('tb_imagens').where({ id_produto: id });
        const imagem_principal = await knex('tb_imagens').where({ id_produto: id }).andWhere({pagina_principal: 1});

        console.log(imagem_principal)
		let imagem_principal_= "";
		
		if(imagem_principal.length==0){
			imagem_principal_= ""
		}else{
			imagem_principal_ = imagem_principal[0].imagem ;
		}

        // Renderiza a página com os dados
        res.render('produtos', {
            id_produto: id,
            titulo: produto.titulo,
            valor: produto.valor,
            descricao: produto.descricao,
			observacao: produto.observacao,
            imagens,
            imagem_principal : imagem_principal_
        });

    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).send('Erro interno no servidor');
    }
});


app.get('/checkout/:id_produto/:qtde', async (req, res) => {
    const { id_produto, qtde } = req.params;

    try {
        const produto = await knex('tb_produto').where('id', id_produto).first();
		
		const imagem_principal = await knex('tb_imagens').where({ id_produto: produto.id }).andWhere({pagina_principal: 1});
		console.log(imagem_principal)
        if (!produto) {
            return res.status(404).send('Produto não encontrado');
        }

        const subtotal = qtde * produto.valor;

        const subtotalFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(subtotal);

        res.render('checkout', {
            id_produto,
            qtde,
            produtos: [produto],
			imagem: imagem_principal[0].imagem,
            subtotal: subtotalFormatado
        });

    } catch (error) {
        console.error('Erro no checkout:', error);
        res.status(500).send('Erro interno do servidor');
    }
});


// Rota para cadastrar produto
app.post("/produto", async (req, res) => {
  try {
    const { titulo, descricao, valor, observacao, lancamentos, grafica, brindes } = req.body;

    if (!titulo || !valor) {
      return res.status(400).json({ erro: "Título e valor são obrigatórios!" });
    }

	let categoria ="";
	
	console.log(brindes)
	
	if(grafica==true){
		categoria="grafica";
	}
	if(brindes==true){
		categoria="brindes";
	}
	
	
    const [id] = await knex("tb_produto").insert({
      titulo,
      descricao,
      valor,
      observacao,
	  lancamentos: 1,
	  categoria
	  
    });

    res.json({ sucesso: true, id });
  } catch (err) {
    console.error("Erro ao inserir produto:", err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});


app.listen( 3000,()=>{
	console.log('Api Rodando porta  3000')
})



app.post('/pedidos',async (req,res)=>{
	const {nome,cpf,email,telefone,cep,rua,numero,complemento,bairro,cidade,uf,id_produto,descricao_produto, qtde_produto, valor_produto, total_produto, forma_pagto, envio } = req.body;
	
	console.log(nome);
	console.log(cpf);
	console.log(email);
	console.log(telefone);
	console.log(cep);
	console.log(rua);
	console.log(numero);
	console.log(complemento);
	console.log(bairro);
	console.log(cidade);
	console.log(uf);
	console.log(id_produto);
	console.log(descricao_produto);
	console.log(qtde_produto);
	console.log(valor_produto);
	console.log(total_produto);
	console.log(forma_pagto);
	console.log(envio);
	
	try{
		const pedidos = await knex('pedidos').insert({
			nome,
			cpf,
			email,
			telefone,
			cep,
			rua,
			numero,
			complemento,
			bairro,
			cidade,
			uf,
			id_produto,
			descricao_produto,
			qtde_produto,
			valor_produto,
			total_produto,
			forma_pagto,
			envio
		});
		
		res.status(200).json({ mensagem: "Pedido realizado com sucesso." });
	}catch(error){
		console.error("Erro ao inserir produto:", err);
		res.status(500).json({ erro: "Erro no servidor" });
		
	}
	
	
})
