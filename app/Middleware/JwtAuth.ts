import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'

export default class JwtAuth {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const headerKey: string | undefined = request.headers().authorization?.split(" ")[0]
    // console.log(headerKey); 
    if (!headerKey) return response.send('No token generated')
    await jwt.verify(headerKey, Env.get('SECRET_KEY'), async (err, data) => {
      if (err || !data) return response.send('Invalid token')
    })
    await next()
  }
}
