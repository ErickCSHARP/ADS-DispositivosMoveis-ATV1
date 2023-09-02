
const calculator = document.querySelector(".calculadora")
const keys = calculator.querySelector(".teclado")
const display = document.querySelector('.caluladora-mostrador');

const displayExpressao = document.getElementById('m-expressao');
const displayValor = document.getElementById('m-operando');
const displayDelta = document.getElementById('m-delta');
const displayAcc = document.getElementById('m-acumulador');
const displayMem = document.getElementById('m-memoria');

const displayValueColorInvalid = "red";
const displayValueColorResultado = "green";

var displayValorInvalido = false;
var horarios = [], operacoes = [];
var digitos_virtual = "";// = [];
var acumulador = "";
var delta = false;
var memoria = "";

keys.addEventListener("click", e => 
{
    if (e.target.matches("button")) 
    {
        const key = e.target;
        const action = key.dataset.action;
        const keyContent = key.textContent;

        if (!action) 
        {
            AdicionarDigito(keyContent);
        }
        else
        {
            if (action === "=" ) Calcular();
            else if (action === "+" || action === "-" || action === "x" || action ==="/") AdicionaOperacao(action);
            else if (action === "delta") delta = !delta;
            else if (action === "limpar") LimpaValorDigitos();
            else if (action === "resetar") 
            {
                LimpaExpressao();
                LimpaValorDigitos();
            }
            

            AtualizaDispExpressao();
            AtualizaDispAcumulador();
            AtualizaDispDelta();
            AtualizaDispMemoria();
            
        }


        AtualizaValorDigitos();
       
    }
})

var flag_calculo_atualizado = false;
function Calcular()
{
    if (horarios.length < 2)
    {
        if (displayExpressao.textContent == "") return;
        else if (!AdicionaOperacao("")) return;
    }

    if(horarios.length == operacoes.length)
    {
        operacoes.pop();
    }

    digitos_virtual = CalcularOperacoes(horarios, operacoes);

    flag_calculo_atualizado = true;
}


function AdicionarDigito(numero)
{
    if (flag_calculo_atualizado === true) 
    {
        LimpaValorDigitos();
        flag_calculo_atualizado = false;
    }
    digitos_virtual += numero;
}

function AdicionaOperacao(op)
{
    if (DisplayValorValido())
    {
        horarios.push( displayValor.textContent.trim() );
        if ( op !== "" ) operacoes.push( op );
        LimpaValorDigitos();
        AdicionarAcumulador();
        return true;
    }
   
    return false;
}

function AdicionarAcumulador()
{
    let idx_hor = horarios.length;
    let idx_op = operacoes.length;

    if (idx_hor == 0) return;
    if (acumulador == "" && idx_hor == 1)
    {
        acumulador = horarios[0];
        return;
    }

    let ultimo_horario = horarios[idx_hor-1];
    let ultima_op = operacoes[idx_op===idx_hor?idx_op-1:idx_op-2];

    acumulador = DelegarCalcula(ultima_op, acumulador, ultimo_horario);

}

function DisplayValorValido()
{
    return !(display.style.background == displayValueColorInvalid || displayValor.textContent == "");
}

function LimpaValorDigitos()
{
    displayValor.textContent = "0:00";
    digitos_virtual = [];
}

function LimpaExpressao()
{
    horarios = [];
    operacoes = [];
}

function AtualizaValorDigitos()
{
    let displayColor = "#252525";
    let division = digitos_virtual.length-2;

    if (digitos_virtual.length > 2) 
    { 
        var m = parseInt(digitos_virtual[digitos_virtual.length-2]);
        if ( m > 5) displayColor = displayValueColorInvalid;
    }

    if (flag_calculo_atualizado)
    {
        displayColor = displayValueColorResultado;
    }

    let diplayed = AplicarFormatacao(digitos_virtual);

    displayValor.textContent = diplayed;
    display.style.background = displayColor;

}

function RemoverFormatacao(str_hora)
{
    return str_hora.replace(":", "");
}

function AplicarFormatacao(str_hora)
{
    const numeroString = str_hora.toString();

    const comprimento = numeroString.length;

    if (comprimento <= 2) 
    {
        return `0:${numeroString.padStart(2, '0')}`;
    } 
    else 
    {
    const primeiraParte = numeroString.slice(0, comprimento - 2);
    const segundaParte = numeroString.slice(comprimento - 2);

    return `${primeiraParte}:${segundaParte}`;
    }
}

function AtualizaDispExpressao()
{
    let textexpression = "";

    if (horarios.length == 0) textexpression = "--";

    for(i=0; i<horarios.length; i++)
    {
        textexpression += horarios[i];

        if (i < operacoes.length)   textexpression += " " + operacoes[i] + " ";
    }

    displayExpressao.textContent = textexpression;
}

function AtualizaDispAcumulador()
{
    if (acumulador == "") 
    {
        //acumulador = "ACC";
        displayAcc.textContent = "ACC";
        return;
    }

    displayAcc.textContent = "=" + acumulador;
}

function AtualizaDispMemoria()
{
    if (memoria == "") 
    {
        displayMem.textContent = "Mem";
        return;
    }

    displayAcc.textContent = "M " + memoria;
}

function AtualizaDispDelta()
{
    displayDelta.textContent = delta === true ? "delta" : "";
}

// function DisplayMode(modo)
// {
//     if (modo == "resultado")
//     {

//     }
//     else (modeo == "nomral")
// }

function CalcularOperacoes(arr_horarios, arr_operadores)
{
    if (arr_horarios.length == 0) return "";
    if (arr_horarios.length < 2) return arr_horarios[0];

    let acc_duracao = arr_horarios[0];
    let op = arr_operadores[0];

    for(i=1; i<arr_horarios.length; i++)
    {
        
        let current_duracao = arr_horarios[i];

        acc_duracao = DelegarCalcula(op, acc_duracao,current_duracao);
        

        op = arr_operadores.at(i);
        if (!op) break;
    }

    let resultado = RemoverFormatacao(acc_duracao);
    return resultado;
}

function ConverterEmHorMin(str_hora)
{
    const split = str_hora.split(":");
        let min = 0, hora = 0;
        
        if (split.length == 1) min = parseInt(split[0]);
        else if (split.length == 2) 
        {
            hora = parseInt(split[0]);
            min = parseInt(split[1]);
        } 

        return [hora, min];
}


function DelegarCalcula(op, tempo1, tempo2)
{
    if (op==="+") total = SomarDuracoes(tempo1, tempo2);
    else if (op==="-") total = SubtrairDuracoes(tempo1, tempo2)
    else if (op==="*") total = multiplicarDuracao(tempo1, tempo2)
    else if (op==="/") total = dividirDuracao(tempo1, tempo2)

    return total;
}

// Função para somar durações de tempo
function SomarDuracoes(tempo1, tempo2) 
{
    const [horas1, minutos1] = ConverterEmHorMin(tempo1);//tempo1.split(':').map(Number);
    const [horas2, minutos2] = ConverterEmHorMin(tempo2);//tempo2.split(':').map(Number);

    const totalMinutos = horas1 * 60 + minutos1 + horas2 * 60 + minutos2;
    const horasResultantes = Math.floor(totalMinutos / 60);
    const minutosResultantes = totalMinutos % 60;

    return `${String(horasResultantes).padStart(2, '0')}:${String(minutosResultantes).padStart(2, '0')}`;
}

// Função para subtrair durações de tempo
function SubtrairDuracoes(tempo1, tempo2) 
{
    const [horas1, minutos1] = ConverterEmHorMin(tempo1);//tempo1.split(':').map(Number);
    const [horas2, minutos2] = ConverterEmHorMin(tempo2);//tempo2.split(':').map(Number);

    const totalMinutos = horas1 * 60 + minutos1 - (horas2 * 60 + minutos2);

    // if (totalMinutos < 0) {
    //    // return '00:00'; // Evitar resultados negativos
    // }

    const horasResultantes = Math.floor(totalMinutos / 60);
    const minutosResultantes = totalMinutos % 60;

    return `${String(horasResultantes).padStart(2, '0')}:${String(minutosResultantes).padStart(2, '0')}`;
}

// Função para multiplicar durações de tempo
function multiplicarDuracao(tempo, fator) 
{
    const [horas, minutos] = tempo.split(':').map(Number);

    const totalMinutos = horas * 60 + minutos;
    const resultadoMinutos = totalMinutos * fator;

    // if (resultadoMinutos < 0) {
    //     return '00:00'; // Evitar resultados negativos
    // }

    const horasResultantes = Math.floor(resultadoMinutos / 60);
    const minutosResultantes = resultadoMinutos % 60;

    return `${String(horasResultantes).padStart(2, '0')}:${String(minutosResultantes).padStart(2, '0')}`;
}

// Função para dividir durações de tempo
function dividirDuracao(tempo, divisor) 
{
    const [horas, minutos] = tempo.split(':').map(Number);

    if (divisor === 0) {
        return '00:00'; // Evitar divisão por zero
    }

    const totalMinutos = horas * 60 + minutos;
    const resultadoMinutos = totalMinutos / divisor;

    // if (resultadoMinutos < 0) {
    //     return '00:00'; // Evitar resultados negativos
    // }

    const horasResultantes = Math.floor(resultadoMinutos / 60);
    const minutosResultantes = resultadoMinutos % 60;

    return `${String(horasResultantes).padStart(2, '0')}:${String(minutosResultantes).padStart(2, '0')}`;
}

function DuracaoMenor(tempo1, tempo2) 
{
    const [horas1, minutos1] = tempo1.split(':').map(Number);
    const [horas2, minutos2] = tempo2.split(':').map(Number);

    const minutosTotais1 = horas1 * 60 + minutos1;
    const minutosTotais2 = horas2 * 60 + minutos2;

    return minutosTotais1 < minutosTotais2 ? tempo1 : tempo2;
}

function DuracaoMaior(tempo1, tempo2)
{
    const [horas1, minutos1] = tempo1.split(':').map(Number);
    const [horas2, minutos2] = tempo2.split(':').map(Number);

    const minutosTotais1 = horas1 * 60 + minutos1;
    const minutosTotais2 = horas2 * 60 + minutos2;

    return minutosTotais1 > minutosTotais2 ? tempo1 : tempo2;
}
