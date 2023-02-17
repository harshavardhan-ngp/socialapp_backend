import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import AuthValidator from 'App/Validators/AuthValidator'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'

interface payload {
  email: string
  password: string
}
export default class UsersController {
  public async register({ request, response }: HttpContextContract) {
    const payload: payload = await request.validate(AuthValidator)
    try {
      const data = await User.create(payload)
      console.log('in', data.id, data.email)
      const accessToken: string = await jwt.sign(
        { id: data.id, email: data.email },
        Env.get('SECRET_KEY')
      )
      response.send({
        success: true,
        message: 'Token Created Successfully',
        accessToken: accessToken,
      })
    } catch {
      response.send({ success: false, message: 'User already exists' })
    }
  }

  public async login({ response, request }: HttpContextContract): Promise<void> {
    const { email, password } = request.body()
    const user = await User.findBy('email', email)
    console.log('user:',  email, password)
    if (user && (await Hash.verify(user.password, password))) {
      const accessToken: string = await jwt.sign(
        { id: user.id, email: user.email },
        Env.get('SECRET_KEY')
      )
      accessToken
        ? response.send({ success: true, accessToken: accessToken })
        : response.send('Invalid User')
    } else {
      response.status(200).send({ success: false, message: 'Incorrect email or password' })
    }
  }
}
