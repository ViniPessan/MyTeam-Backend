const express = require('express');
const { sequelize } = require('./sequelize,js');
const { User } = require('./sequelize,js');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000; 
app.use(cors());
app.use(express.json())  

sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });

  sequelize.sync()
.then(() => {
  console.log('Modelos sincronizados com o banco de dados');
})
.catch(err => {
  console.error('Erro ao sincronizar modelos com o banco de dados:', err);
});


  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });


//Mostrar usuários

  app.get('/users', async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users)
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      res.status(500).json({message:"Erro ao buscar usuários"})
    }
  })

  //Mostrar usuário individual

app.get('/users/:id', async (req, res) => {
  try{
    const userId = req.params.id
    const user = await User.findByPk(userId)
    if(user){
      res.json(user);
    } else {
      res.status(400).json({message: "Usuário não encontrado."})
    }
  } catch (error) {
    console.error("Erro ao buscar usuário", error)
    res.status(500).json({ message: "Erro ao buscar usuário"})
  }
})

//Criar usuário
app.post('/users', async(req,res) => {
  try{
    const {name, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({name, email, password: hashedPassword})
    res.status(201).json(newUser)
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ message: "Erro ao criar usuário" });
  }
})

//Login
app.post('/login', async (req, res) => {
  const {email, password} = req.body

  try {
    const user = await User.findOne({where: {email}})
    if(!user){
      return res.status(401).json({message: "Credenciais inválidas"})
    }

     const passwordMatch = await bcrypt.compare(password, user.password);
     if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
     }
    
    const token = jwt.sign({ userId: user.id }, 'secreto', { expiresIn: '1h' });

    res.json({token, userId: user.id, message: "Login efetuado com sucesso!"})
    
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro ao fazer login' });
  }
})



//Atualizar usuário
app.put('/users/:id', async (req, res) =>{
  try{
    const userId = req.params.id
    const {name, email, password} = req.body
    const user = await User.findByPk(userId)

    if(!user){
      return res.status(404).json({message:"Usuário não encontrado."})
    }

    if (password) { 
      const hashedPassword = await bcrypt.hash(password, 10); 
      await user.update({name, email, password: hashedPassword}); 
    } else {
      await user.update({name, email});
    }
    
  } catch (error){
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
})


//Excluir usuário
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    await user.destroy();
    res.status(204).end();
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    res.status(500).json({ message: "Erro ao excluir usuário" });
  }
});


// MÉTODO SEM O SEQUELIZE

  // app.get('/users', (req, res) => {
  //   pool.query('SELECT * FROM users', (err, result) => {
  //     if (err){
  //       console.error("Erro ao buscar usuários no banco de dados", err)
  //       res.status(500).send("Erro ao buscar usuários")
  //     } else {
  //       res.json(result.rows)
  //     }
  //   })
  // })

  // app.get('/users/:id', (req, res) => {
  //   const userId = req.params.id;
  //   pool.query('SELECT * FROM users WHERE id = $1', [userId], (err, result) => {
  //     if (err) {
  //       console.error("Erro ao buscar usuário:", err);
  //       return res.status(500).json({ message: 'Erro ao buscar usuário.' });
  //     }
  //     if (result.rows.length === 0) {
  //       return res.status(404).json({ message: 'Usuário não encontrado.' });
  //     }
  //     res.json(result.rows[0]);
  //   });
  // });



  // app.post('/users', (req, res) => {
  //   const { name, email, password } = req.body;
  //   if (!name || !email || !password) {
  //     return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  //   }


  //   pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, password], (err, result) => {
  //     if (err) {
  //       console.error("Erro ao adicionar usuário:", err);
  //       return res.status(500).json({ message: 'Erro ao adicionar usuário.' });
  //     }
  //     res.status(201).json({ message: 'Usuário adicionado com sucesso.' });
  //   });
  // });


  // app.put('/users/:id', (req, res) => {
  //   const userId = req.params.id;
  //   const { name, email, password } = req.body;
  //   pool.query('UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4', [name, email, password, userId], (err, result) => {
  //     if (err) {
  //       console.error("Erro ao atualizar usuário:", err);
  //       return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  //     }
  //     if (result.rowCount === 0) {
  //       return res.status(404).json({ message: 'Usuário não encontrado.' });
  //     }
  //     res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
  //   });
  // });


  // app.delete('/users/:id', (req, res) => {
  //   const userId = req.params.id;
  //   pool.query('DELETE FROM users WHERE id = $1', [userId], (err, result) => {
  //     if (err) {
  //       console.error("Erro ao excluir usuário:", err);
  //       return res.status(500).json({ message: 'Erro ao excluir usuário.' });
  //     }
  //     if (result.rowCount === 0) {
  //       return res.status(404).json({ message: 'Usuário não encontrado.' });
  //     }
  //     res.status(200).json({ message: 'Usuário excluído com sucesso.' });
  //   });
  // });
