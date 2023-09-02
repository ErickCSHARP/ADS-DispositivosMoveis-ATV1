
const calculator = document.querySelector(".calculadora")
const keys = calculator.querySelector(".teclado")
const display = document.querySelector('.caluladora-mostrador');

const buttonLigar = document.getElementById("btn-ligar");
const displayHisScroll = document.querySelector(".mostrador-historico");
const displayExpressao = document.getElementById('m-expressao');
const displayValor = document.getElementById('m-operando');
const displayDelta = document.getElementById('m-delta');
const displayTotal = document.getElementById('m-total');
const displayMem = document.getElementById('m-memoria');
const displayHis = document.getElementById('m-expressao-historico');

const displayValueColorInvalid = "#532121";
const displayValueColorResultado = "green";
const displayValueColorBotaoOn = "#a6ff00";
const displayValueColorBotaoOff = "black";
const displayValueColorBacklihgtOn = "#252525";
const displayValueColorBacklihgtOff = "black";

var displayValorInvalido = false;
var horarios = [], operacoes = [];
var arr_totalizadores = [], arr_expressoes = [];
var digitos_virtual = "";// = [];
var acumulador = "";
var delta = false;
var memoria = "";
var total;


var ligado = false;
BotaoLigar();

buttonLigar.onclick = BotaoLigar;


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
            if (action === "=")
            {
              
                if (!Totalizar()) return;

                AtualizaDispHistorico();
                AtualizaDispTotal();
                LimpaExpressao();
            }
            else if (action === "+" || action === "-" || action === "x" || action ==="/") 
            {
                let op = action;
                if (delta === true) 
                {
                    if (horarios.length % 2 == 0) op = "à"
                }

                AdicionaOperacao(op);
            }
            else if (action === "delta") 
            {
                delta = !delta;
                LimpaExpressao();
            }
            else if (action === "ms") { if (DisplayValorValido()) memoria = AplicarFormatacao(digitos_virtual); }
            else if (action === "mr") { if (memoria != "") digitos_virtual = memoria; }
            else if (action === "mt") { if (total != "") memoria = total; }
            else if (action === "mc") memoria = "";
            else if (action === "limpar") LimpaValorDigitos();
            else if (action === "resetar") 
            {
                total = "";
                memoria = "";
                LimpaExpressao();
                LimpaValorDigitos();
                LimpaHistorico();
                AtualizaDispHistorico();
            }
            

            AtualizaDispExpressao();
            AtualizaDispTotal();
            AtualizaDispDelta();
            AtualizaDispMemoria();
            
        }
        AtualizaValorDigitos();
    }
})

function Totalizar()
{
  
    if (horarios.length == 0) return false;

    if (displayValor.textContent != "" && displayValor.textContent != "0:00")
    {
        if (!AdicionaOperacao("")) return false;   
    }
    else if (horarios.length < 2) 
    {
         return false;
    }

    if (delta === true && !(horarios.length % 2 === 0)) return false;

    if(horarios.length == operacoes.length)
    {
        operacoes.pop();
    }

    if (delta === true)
    {
        total = CalcularDeltaOperacoes(horarios, operacoes);
    }
    else
    {
        total = CalcularOperacoes(horarios, operacoes);
    }
    
    expression = FormatarOperacoes(horarios, operacoes);

    arr_expressoes.push( expression );
    arr_totalizadores.push( total );
    
    CalcularTotal();

    return true;
}


function AdicionarDigito(numero)
{
//    LimpaValorDigitos();
    digitos_virtual += numero;
}

function AdicionaOperacao(op)
{
    let horario = "";
    if (op == undefined) op = "";

    if (DisplayValorValido() && displayValor.textContent != "0:00" && displayValor.textContent != "00" && displayValor.textContent != "0")
    {
        horario = AplicarFormatacao(displayValor.textContent.trim());
    }
    else if (horarios.length > 0 && operacoes.length > 0)
    {
        [h, o] = ObterUltimaHorarioOperacao();
        horario = h;
        op = op == ""? o:op;
    }
   
    if (ValidarFormato(horario))
    {
        horarios.push( horario);
        if ( op !== "" ) operacoes.push( op );
        LimpaValorDigitos();
        return true;
    }
    
    return false;
}

function AdicionarAcumulador()
{
    [ultimo_horario, ultima_op] = ObterUltimaHorarioOperacao();

    if (ultimo_horario == null) return;
    else if (acumulador == "" && horarios.length == 1) acumulador = ultimo_horario;
    else acumulador = DelegarCalcula(ultima_op, acumulador, ultimo_horario);
}

function CalcularTotal()
{
    let soma = "00:00";
    arr_totalizadores.forEach(c => soma = SomarDuracoes(soma, c));

    total = soma;
}

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

    return acc_duracao;

    let resultado = RemoverFormatacao(acc_duracao);
    return resultado;
}

function CalcularDeltaOperacoes(arr_horarios, arr_operadores)
{
    
    if (arr_horarios.length == 0) return "";
    if (!(horarios.length % 2 == 0)) return "";

    ;// = arr_operadores[0];

    let arr_deltas = [];
    for(i=0; i<arr_horarios.length; i+=2)
    {
        let periodo = SubtrairDuracoes(arr_horarios[i+1], arr_horarios[i]);
        arr_deltas.push(periodo);
//        op = arr_operadores.at(i);
    }

    let acc_delta = arr_deltas[0];
    //let op = arr_operadores[0];

    if (arr_deltas.length < 2) return acc_delta

    for (i=1; i<arr_deltas.length; i++ )
    {
        op = arr_operadores.at((i*2)-1);
        acc_delta = DelegarCalcula(op, acc_delta, arr_deltas[i]);
        
    }

    return acc_delta;

    let resultado = RemoverFormatacao(acc_duracao);
    return resultado;
}

function DelegarCalcula(op, tempo1, tempo2)
{
    let total = tempo1;

    if (op==="+") total = SomarDuracoes(tempo1, tempo2);
    else if (op==="-") total = SubtrairDuracoes(tempo1, tempo2)
    else if (op==="*") total = multiplicarDuracao(tempo1, tempo2)
    else if (op==="/") total = dividirDuracao(tempo1, tempo2)

    return total;
}

function ObterUltimaHorarioOperacao()
{

    let idx_hor = horarios.length;
    let idx_op = operacoes.length;

    if (idx_hor == 0) return null;
    if (idx_hor == 1 || idx_hor == 2) idx_op = 1;
    else idx_op -= 1;

    let ultimo_horario = horarios[idx_hor-1];
    let ultima_op = operacoes[idx_op-1];

    return [ultimo_horario, ultima_op];
}

function DisplayValorValido()
{
    return ValidarFormato(displayValor.textContent);
}

function LimpaValorDigitos()
{
    displayValor.textContent = "";
    digitos_virtual = [];
}

function LimpaExpressao()
{
    horarios = [];
    operacoes = [];
}

function LimpaHistorico()
{
    arr_expressoes = [];
    arr_totalizadores = [];
}

function FormatarOperacoes(hors, ops)
{
    let textexpression = "";

    if (hors.length == 0) return textexpression;

    for(i=0; i<hors.length; i++)
    {
        textexpression += hors[i];

        if (i < ops.length)   textexpression += " " + ops[i] + " ";
    }

    return textexpression;
}

function RemoverFormatacao(str_hora)
{
    return str_hora.replace(":", "");
}

function AplicarFormatacao(str_hora)
{
    str_hora = str_hora.replace(":", "");

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

function ValidarFormato(str_horario)
{
    if (str_horario == undefined) return false;
    let size = str_horario.length;

    if (size == 0) return false;
    if (size == 1 && str_horario.charAt(0) == "0") return false;

    let s = "";
    for (let i = size - 1; i >= 0; i--) 
    {
        s += str_horario[i];
    }


    if (size >= 2)
    {
        if (parseInt(s.charAt(1)) > 5) return false;
        if (size == 3) return false;
        if (size >= 3 && s.charAt(2) != ":") return false;
    }
    return true;
}

function AtualizaDispExpressao()
{
    displayExpressao.textContent = FormatarOperacoes(horarios, operacoes);
}

function AtualizaValorDigitos()
{
    let diplayed = "";
    if (digitos_virtual.length > 2)
    {
        diplayed = AplicarFormatacao(digitos_virtual);
    }
    else
    {
        diplayed = digitos_virtual;
    }

    if (ValidarFormato(diplayed) || diplayed == "")
    {
        display.style.background = "#252525";
    }
    else
    {
        display.style.background = displayValueColorInvalid;
    }

    displayValor.textContent = diplayed;
  // display.style.background = displayValorInvalido === true? displayValueColorInvalid : "#252525";

}

function AtualizaDispTotal()
{
    if (!total || total == "" || total == "00:00") 
    {
        //acumulador = "ACC";
        displayTotal.textContent = "";
        return;
    }

    displayTotal.textContent = "TOTAL " + total;
}

function AtualizaDispMemoria()
{
    if (memoria == "") 
    {
        displayMem.textContent = "Mem";
        return;
    }

    displayMem.textContent = memoria;
}

function AtualizaDispDelta()
{
    displayDelta.textContent = delta === true ? "delta" : "-";
}

function AtualizaDispHistorico()
{
    let innerHtml = "";

    for(i = 0; i < arr_expressoes.length; i++)
    {
        innerHtml += arr_expressoes[i] + " = " + arr_totalizadores[i] + "<br>";
    }

    displayHis.innerHTML = innerHtml;

    //var lastElement = displayHisScroll.lastElementChild;
    //lastElement.scrollIntoView({ behavior: 'smooth' });

    //displayHisScroll.scrollIntoView()
    displayHisScroll.scrollTop = displayHisScroll.scrollHeight - displayHisScroll.clientHeight;
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


function BotaoLigar()
{
    ligado = !ligado;
    
    if (ligado)
    {
        buttonLigar.style.color = displayValueColorBotaoOn;
        display.style.background = displayValueColorBacklihgtOn;
        displayValor.textContent = "0:00";
        displayMem.textContent = "MEM";
        displayDelta.textContent = "-";
    }
    else
    {
        buttonLigar.style.color = displayValueColorBotaoOff;
        display.style.background = displayValueColorBacklihgtOff;
        displayValor.textContent = "";
        displayMem.textContent = "";
        displayDelta.textContent = "";
        displayHis.innerHTML = "";

        LimpaExpressao();
        LimpaHistorico();
        LimpaValorDigitos();
        memoria = "";
    }
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

// // Função para multiplicar durações de tempo
// function multiplicarDuracao(tempo, fator) 
// {
//     const [horas, minutos] = tempo.split(':').map(Number);

//     const totalMinutos = horas * 60 + minutos;
//     const resultadoMinutos = totalMinutos * fator;

//     // if (resultadoMinutos < 0) {
//     //     return '00:00'; // Evitar resultados negativos
//     // }

//     const horasResultantes = Math.floor(resultadoMinutos / 60);
//     const minutosResultantes = resultadoMinutos % 60;

//     return `${String(horasResultantes).padStart(2, '0')}:${String(minutosResultantes).padStart(2, '0')}`;
// }

// // Função para dividir durações de tempo
// function dividirDuracao(tempo, divisor) 
// {
//     const [horas, minutos] = tempo.split(':').map(Number);

//     if (divisor === 0) {
//         return '00:00'; // Evitar divisão por zero
//     }

//     const totalMinutos = horas * 60 + minutos;
//     const resultadoMinutos = totalMinutos / divisor;

//     // if (resultadoMinutos < 0) {
//     //     return '00:00'; // Evitar resultados negativos
//     // }

//     const horasResultantes = Math.floor(resultadoMinutos / 60);
//     const minutosResultantes = resultadoMinutos % 60;

//     return `${String(horasResultantes).padStart(2, '0')}:${String(minutosResultantes).padStart(2, '0')}`;
// }

// function DuracaoMenor(tempo1, tempo2) 
// {
//     const [horas1, minutos1] = tempo1.split(':').map(Number);
//     const [horas2, minutos2] = tempo2.split(':').map(Number);

//     const minutosTotais1 = horas1 * 60 + minutos1;
//     const minutosTotais2 = horas2 * 60 + minutos2;

//     return minutosTotais1 < minutosTotais2 ? tempo1 : tempo2;
// }

// function DuracaoMaior(tempo1, tempo2)
// {
//     const [horas1, minutos1] = tempo1.split(':').map(Number);
//     const [horas2, minutos2] = tempo2.split(':').map(Number);

//     const minutosTotais1 = horas1 * 60 + minutos1;
//     const minutosTotais2 = horas2 * 60 + minutos2;

//     return minutosTotais1 > minutosTotais2 ? tempo1 : tempo2;
// }
