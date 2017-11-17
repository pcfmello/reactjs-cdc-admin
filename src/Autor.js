import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import SubmitCustomizado from './componentes/SubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

export default class AutorBox extends Component {

  constructor() {
    super();
    this.state = {
      lista: [],
    }
  };

  componentDidMount() {
    $.ajax({
      url: 'http://localhost:8080/api/autores',
      dataType: 'json',
      success: function(resposta){
        this.setState({ lista: resposta })
      }.bind(this),
      error: function(erro) {
        console.log('Houve um erro na resposta do servidor', erro);
      }
    })

    PubSub.subscribe('atualiza-lista-autores', function(topico, novaLista) {
      this.setState({ lista: novaLista });
    }.bind(this));

  }

  render() {
    return(
      <div>
        <FormularioAutor />
        <TabelaAutores lista={ this.state.lista } />
      </div>
    );
  }
}

class FormularioAutor extends Component {

  constructor() {
    super();
    this.state = {
      lista: [],
      nome: '',
      email: '',
      senha: ''
    };
    this.enviaForm = this.enviaForm.bind(this);
    this.setNome = this.setNome.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setSenha = this.setSenha.bind(this);
  }

  enviaForm(evento){
    evento.preventDefault();
    $.ajax({
      url:'http://localhost:8080/api/autores',
      contentType:'application/json',
      dataType:'json',
      type:'post',
      data: JSON.stringify({
          nome: this.state.nome,
          email: this.state.email,
          senha: this.state.senha
      }),
      beforeSend: function() {
        PubSub.publish('limpa-erros', {});
      },
      success: function(novaListagem){
        // dispara um aviso geral de novaListagem disponivel
        PubSub.publish('atualiza-lista-autores', novaListagem);
        this.setState({ nome: '', email: '', senha: ''});
      }.bind(this),
      error: function(erro){
        if(erro.status === 400) {
          new TratadorErros().publicaErros(erro.responseJSON);
        }
      }
    });
  }

  setNome(evento){
    this.setState({
      nome: evento.target.value
    });
  }

  setEmail(evento){
    this.setState({
      email: evento.target.value
    });
  }

  setSenha(evento){
    this.setState({
      senha: evento.target.value
    });
  }

  render(){
    return(
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
          <InputCustomizado id="nome" type="text" name="nome"
              value={this.state.nome} onChange={this.setNome}
              label="Nome"/>
          <InputCustomizado id="email" type="text" name="email"
              value={this.state.email} onChange={this.setEmail}
              label="Email"/>
          <InputCustomizado id="senha" type="password" name="senha"
              value={this.state.senha} onChange={this.setSenha}
              label="Senha"/>
          <SubmitCustomizado titulo="Enviar" />
        </form>
      </div>
    );
  }
}

class TabelaAutores extends Component {

  render() {
    return(
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>email</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.lista.map((autor) => {
                return (
                  <tr key={ autor.id }>
                    <td>{ autor.nome }</td>
                    <td>{ autor.email }</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}
