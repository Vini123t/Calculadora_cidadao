'use strict';

const functions = require('firebase-functions');
const { WebhookClient, Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

// Exportando a função para ser usada no Firebase Functions
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  // Função de boas-vindas que é acionada quando o usuário inicia uma conversa com o agente
  function welcome(agent) {
    agent.add('Welcome to my agent!');
  }

  // Função de fallback, que é acionada quando o agente não entende a entrada do usuário
  function fallback(agent) {
    agent.add("I didn't understand");
    agent.add("I'm sorry, can you try again?");
  }

  // Função que calcula o número de meses necessários para alcançar um determinado valor final com base em taxa de juros e valor de depósito mensal
  function mes(agent) {
    // Obtendo os parâmetros da intenção do Dialogflow
    const valorFinal = parseFloat(agent.parameters.valorFinal);
    const taxaJuros = parseFloat(agent.parameters.taxaJuros) / 100;
    const valorDeposito = parseFloat(agent.parameters.valorDeposito);
    let meses = parseFloat(agent.parameters.meses || 0);
    let valorAtual = valorDeposito;

    // Calculando o número de meses necessários para alcançar o valor final
    while (valorAtual < valorFinal) {
      valorAtual = (valorAtual + valorDeposito) * (1 + taxaJuros);
      meses++;
    }

    agent.add(`Número de meses: ${meses}\nOBRIGADO, SE DESEJA FAZER OUTRA SIMULAÇÃO DIGITE 0`);
  }

  // Função que calcula a taxa de juros necessária para alcançar um determinado valor final com base no valor de depósito mensal e no número de meses
  function taxa(agent) {
    var valorFinal = parseFloat(agent.parameters.valor);
    var valorDeposito = parseFloat(agent.parameters.deposito);
    var meses = parseFloat(agent.parameters.mes);
    var taxaJuros = 0.01; // Taxa de juros inicial
    var valorAtual = 0;

    // Calculando a taxa de juros necessária
    while (valorAtual < valorFinal) {
      valorAtual = 0;

      for (var i = 0; i < meses; i++) {
        valorAtual = (valorAtual + valorDeposito) * (1 + taxaJuros);
      }

      if (valorAtual < valorFinal) {
        taxaJuros += 0.01; // Aumenta a taxa de juros em 1% a cada iteração até atingir o valor final
      }
    }

    agent.add("Taxa de juros: " + (taxaJuros * 100).toFixed(2) + "%" +
              "\nOBRIGADO, SE DESEJA FAZER OUTRA SIMULAÇÃO DIGITE 0");
  }

  // Função que calcula o valor de depósito mensal necessário para alcançar um determinado valor final com base na taxa de juros e no número de meses
  function deposito(agent) {
    var valorFinal = parseFloat(agent.parameters.valor);
    var taxaJuros = parseFloat(agent.parameters.taxa) / 100;
    var meses = parseFloat(agent.parameters.mes);
    var valorDeposito = parseFloat(agent.parameters.deposito);
    var valorAtual = 0;
    valorDeposito = 0;

    // Calculando o valor de depósito mensal necessário
    while (valorAtual < valorFinal) {
      valorDeposito += 1;
      valorAtual = 0;

      for (var i = 0; i < meses; i++) {
        valorAtual = (valorAtual + valorDeposito) * (1 + taxaJuros);
      }
    }

    agent.add("O deposito mensal deve ser de:" + valorDeposito.toFixed(2) +
           '\n OBRIGADO SE DESEJA FAZER OUTRA SIMULAÇAO DIGITE 0');
  }

  // Função que calcula o valor final com base no valor de depósito mensal, taxa de juros e número de meses
  function valorfinal(agent) {
    var valorFinal = parseFloat(agent.parameters.valorf);
    var meses = parseFloat(agent.parameters.mes);
    var taxaJuros = parseFloat(agent.parameters.taxa) / 100;
    var valorDeposito = parseFloat(agent.parameters.deposito);
    var resultado = 0;

    // Calculando o valor final
    for (var i = 0; i < meses; i++) {
      resultado = (resultado + valorDeposito) * (1 + taxaJuros);
    }

    agent.add("Valor obtido ao final: R$ " + resultado.toFixed(2) +
              '\n OBRIGADO SE DESEJA FAZER OUTRA SIMULAÇAO DIGITE 0');
  }

  // Mapeando as intenções do Dialogflow para as funções correspondentes
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('1 - MES', mes);
  intentMap.set('2 - TAXA', taxa);
  intentMap.set('3 - depósito', deposito);
  intentMap.set('4 - VALORFINAL', valorfinal);

  agent.handleRequest(intentMap);
});
