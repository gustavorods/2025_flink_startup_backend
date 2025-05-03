const { z } = require('zod');

const userSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sobrenome: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  
  esportes: z.array(z.string()).nonempty("Informe ao menos um esporte"),

  redes_sociais: z.object({
    tiktok: z.string().startsWith("@", "Deve começar com @"),
    instagram: z.string().startsWith("@", "Deve começar com @"),
    x: z.string().startsWith("@", "Deve começar com @"),
  }),
});

module.exports = { userSchema };
