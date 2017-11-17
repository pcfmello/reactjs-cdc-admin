import PubSub from 'pubsub-js';

export default class TratadorErros {

  publicaErros(erros) {
    console.log(erros.errors);
    erros.errors.forEach(function(erro) {
      PubSub.publish('erro-validacao', erro);
    });
  }
}
