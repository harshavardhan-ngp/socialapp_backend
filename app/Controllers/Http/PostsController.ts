import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import FileUploadValidator from 'App/Validators/FileUploadValidator'
import Post from 'App/Models/Post'
import OptionalValidator from 'App/Validators/OptionalValidator'

export default class PostsController {
  public async displayAll({ response }: HttpContextContract) {
   const data = await Post.all()
   response.send({data:data, success:true})
  }

  public async displayOne({ response, params }: HttpContextContract) {
    const data = await Post.findOrFail(params.id)
   response.send(data)
  }

  public async upload({ response, request }: HttpContextContract) {
    const image=request.file('image')
    console.log('image:', typeof image);
    
    const payload = await request.validate(FileUploadValidator)
    if (payload.image.extname) {
      const image = new Date().getTime().toString() + `.${payload.image.extname}`
      // console.log(image)
      await payload.image.move(Application.tmpPath('uploads'), {
        name: image,
      })
      await Post.create({ image: image, caption: payload.caption })
      return response.send({ message: 'Inserted Successfully', success: true })
    } else return response.send('fail')
  }

  public async update({ response, request, params }: HttpContextContract) {
    const data = await Post.findOrFail(params.id)
    const payload = await request.validate(OptionalValidator)
    // console.log(payload.image)
    if (payload) {
      let image
      if (payload.image) {
        image = new Date().getTime().toString() + `.${payload.image.extname}`
        await payload.image.move(Application.tmpPath('uploads'), {
          name: image,
        })
        await data.merge({ image: image }).save()
      } else {
        await data.merge({ caption: payload.caption }).save()
      }
      return response.send({ message: 'Updated Successfully', success: true })
    } else return response.send('fail')
  }

  public async destroy({ response, request, params }: HttpContextContract) {
    const data = await Post.findOrFail(params.id)
    // console.log(payload.image)
    if (data) {
        await data.delete()
      return response.send({ message: 'Deleted Successfully', success: true })
    } else return response.send({ message: 'No record found', success: false })
  }
}
