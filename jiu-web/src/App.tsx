import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Lesson = {
  id: string;
  title: string;
};

type Section = {
  id: string;
  title: string;
  description?: string;
  lessons?: Lesson[];
  sections?: Section[];
};

const COURSE: Section[] = [
  {
    id: "intro",
    title: "Instruções Iniciais",
    lessons: [
      { id: "intro-01", title: "01 - Seja Bem-Vindo" },
      { id: "intro-02", title: "02 - A Melhor Forma de Estudar" },
      { id: "intro-03", title: "03 - Aplicativo Sparkle" },
    ],
  },
  {
    id: "ferramentas",
    title: "Ferramentas",
    lessons: [
      { id: "ferramentas-01", title: "01 - Vídeo Explicativo Parte 1" },
      { id: "ferramentas-02", title: "02 - Vídeo Explicativo Parte 2" },
    ],
  },
  {
    id: "regras",
    title: "Descomplicando Regras Jiu-Jitsu",
    lessons: [
      { id: "regras-01", title: "01 - Introdução às Regras do Jiu-Jitsu" },
      { id: "regras-02", title: "02 - Aula sobre Pontuações" },
      { id: "regras-03", title: "03 - Faltas e Punições" },
      { id: "regras-04", title: "04 - As Regras do Combate" },
      { id: "regras-05", title: "05 - As Regras do Pódio e Conduta" },
      { id: "regras-06", title: "06 - Categorias de Peso e Idade" },
      { id: "regras-07", title: "07 - Arbitragem e Gestos" },
      { id: "regras-08", title: "08 - Aula sobre Finalizações Válidas" },
      { id: "regras-09", title: "09 - Aula sobre Empates e Decisões" },
      { id: "regras-10", title: "10 - Aula de Casos Específicos 1" },
      { id: "regras-11", title: "11 - Aula de Casos Específicos 2" },
      { id: "regras-12", title: "12 - Aula de Casos Específicos 3" },
      { id: "regras-13", title: "13 - Aula de Casos Específicos 4" },
    ],
  },
  {
    id: "nutricao",
    title: "Manual da Nutrição para o Jiu",
    lessons: [
      { id: "nutricao-01", title: "01 - Aula de Introdução à Nutrição" },
      { id: "nutricao-02", title: "02 - O Jiu-Jitsu e a Nutrição" },
      { id: "nutricao-03", title: "03 - Aula de Planejamento Alimentar" },
      { id: "nutricao-04", title: "04 - Suplementação para o Jiu-Jitsu" },
      { id: "nutricao-05", title: "05 - Aula de Hidratação" },
      { id: "nutricao-06", title: "06 - Aula de Recuperação Pós-Treino" },
      { id: "nutricao-07", title: "07 - Aula de Dieta para Competição" },
    ],
  },
  {
    id: "preparacao-fisica",
    title: "Manual da Preparação FIsica",
    lessons: [
      { id: "prep-01", title: "01 - Aula de Introdução à Preparação Física" },
      { id: "prep-02", title: "02 - Aula de Força e Potência" },
      { id: "prep-03", title: "03 - Aula de Resistência" },
      { id: "prep-04", title: "04 - Aula de Mobilidade e Flexibilidade" },
      { id: "prep-05", title: "05 - Aula de Prevenção de Lesões" },
      { id: "prep-06", title: "06 - Aula de Periodização" },
      { id: "prep-07", title: "07 - Aula de Treino de Gás" },
      { id: "prep-08", title: "08 - Aula de Exercícios Específicos" },
      { id: "prep-09", title: "09 - Aula Final" },
    ],
  },
  {
    id: "mentalidade",
    title: "Mentalidade Campeão",
    lessons: [
      { id: "mental-01", title: "01 - Apresentação" },
      { id: "mental-02", title: "02 - Aula sobre Imediatismo" },
      { id: "mental-03", title: "03 - Aula sobre Autocobrança" },
      { id: "mental-04", title: "04 - Aula sobre Ansiedade" },
      { id: "mental-05", title: "05 - Aula sobre Motivação" },
      { id: "mental-06", title: "06 - Aula sobre Foco" },
      { id: "mental-07", title: "07 - Aula sobre Metas" },
      { id: "mental-08", title: "08 - Aula sobre Medo" },
      { id: "mental-09", title: "09 - Aula sobre Burnout" },
      { id: "mental-10", title: "10 - Aula Complementar 1" },
      { id: "mental-11", title: "11 - Aula Complementar 2" },
    ],
  },
  {
    id: "condicionamento",
    title: "Condicionamento Fisico",
    lessons: [
      { id: "cond-01", title: "01 - Circuito Nível 1" },
      { id: "cond-02", title: "02 - Circuito Nível 2" },
      { id: "cond-03", title: "03 - Circuito Nível 3" },
    ],
  },
  {
    id: "drills",
    title: "Drills",
    lessons: [
      { id: "drills-01", title: "01 - Introdução aos Drills" },
      { id: "drills-02", title: "02 - Como Fazer os Drills" },
      { id: "drills-03", title: "03 - Drills de Velocidade" },
      { id: "drills-04", title: "04 - Drill de Pegadas" },
      { id: "drills-05", title: "05 - Drill de Antecipação de Chamada" },
      {
        id: "drills-06",
        title: "06 - Drill de Antecipação de Chamada Variação",
      },
      { id: "drills-07", title: "07 - Drill de Double Leg" },
      { id: "drills-08", title: "08 - Drill de Single Leg" },
      { id: "drills-09", title: "09 - Drill de Movimentação na Passagem" },
      { id: "drills-10", title: "10 - Drill de Movimentação das Pernas" },
      { id: "drills-11", title: "11 - Drill de Leg Drag" },
      { id: "drills-12", title: "12 - Drill de Passagem Engolindo a Perna 1" },
      { id: "drills-13", title: "13 - Drill de Passagem Engolindo a Perna 2" },
      { id: "drills-14", title: "14 - Drill de Passagem de Guarda 1" },
      { id: "drills-15", title: "15 - Drill de Passagem de De La Riva" },
      { id: "drills-16", title: "16 - Drill de Passagem de Guarda 2" },
      { id: "drills-17", title: "17 - Drill de Passagem de Guarda 3" },
      { id: "drills-18", title: "18 - Drill de Passagem de Guarda 4" },
      { id: "drills-19", title: "19 - Drill de Passagem na Pressão" },
      {
        id: "drills-20",
        title: "20 - Drill de Pegada de Costas Partindo da Passagem",
      },
      { id: "drills-21", title: "21 - Drill de Chave de Braço por Cima" },
      { id: "drills-22", title: "22 - Drill Diamante: Como Ter Uma Boa Base" },
      { id: "drills-23", title: "23 - Drill de Reposição de Guarda" },
      { id: "drills-24", title: "24 - Drill de Inversão" },
      { id: "drills-25", title: "25 - Drill de Berimbolo" },
      { id: "drills-26", title: "26 - Drill de Armdrag" },
      { id: "drills-27", title: "27 - Drill de Finalização da Guarda 1" },
      { id: "drills-28", title: "28 - Drill de Finalização da Guarda 2" },
      { id: "drills-29", title: "29 - Drill de Finalizações Infinitas" },
      { id: "drills-30", title: "30 - Drill de Single Leg Partindo da Guarda" },
      { id: "drills-31", title: "31 - Drill de Guarda X e One Leg X" },
      { id: "drills-32", title: "32 - Drill de Cinto de Segurança" },
      { id: "drills-33", title: "33 - Drill de Pegada de Costas" },
      { id: "drills-34", title: "34 - Drill de Montada e Costas" },
      { id: "drills-35", title: "35 - Drill de Apoios e Transições" },
    ],
  },
  {
    id: "faixa-branca",
    title: "Faixa - Branca",
    sections: [
      {
        id: "fb-100kg",
        title: "100kg",
        lessons: [
          { id: "fb-100kg-01", title: "01 - Estabilização dos 100kg" },
          { id: "fb-100kg-02", title: "02 - Saída dos 100kg 1" },
          { id: "fb-100kg-03", title: "03 - Saída dos 100kg 2" },
          { id: "fb-100kg-04", title: "04 - Saída dos 100kg 3" },
          { id: "fb-100kg-05", title: "05 - Saída dos 100kg 4" },
          { id: "fb-100kg-06", title: "06 - Transição" },
          {
            id: "fb-100kg-07",
            title: "07 - Transição para o Joelho na Barriga",
          },
          { id: "fb-100kg-08", title: "08 - Transição para a Montada" },
          { id: "fb-100kg-09", title: "09 - Finalização 1" },
          { id: "fb-100kg-10", title: "10 - Finalização 2" },
          { id: "fb-100kg-11", title: "11 - Finalização 3" },
          { id: "fb-100kg-12", title: "12 - Finalização 4" },
          { id: "fb-100kg-13", title: "13 - Finalização 5" },
          { id: "fb-100kg-14", title: "14 - Exercício Parte 1" },
          { id: "fb-100kg-15", title: "15 - Exercício Parte 2" },
          { id: "fb-100kg-16", title: "16 - Exercício Parte 3" },
        ],
      },
      {
        id: "fb-costas",
        title: "Costas",
        lessons: [
          {
            id: "fb-costas-01",
            title: "01 - Introdução ao Controle das Costas",
          },
          { id: "fb-costas-02", title: "02 - Saída das Costas 1" },
          { id: "fb-costas-03", title: "03 - Reposição de Guarda das Costas" },
          { id: "fb-costas-04", title: "04 - Transição de Apoios" },
          { id: "fb-costas-05", title: "05 - Transição para Pegada de Costas" },
          { id: "fb-costas-06", title: "06 - Transição com Inversão" },
          { id: "fb-costas-07", title: "07 - Finalização 1" },
          { id: "fb-costas-08", title: "08 - Finalização 2" },
          { id: "fb-costas-09", title: "09 - Finalização 3" },
          { id: "fb-costas-10", title: "10 - Finalização 4" },
          { id: "fb-costas-11", title: "11 - Finalização 5" },
        ],
      },
      {
        id: "fb-defesa",
        title: "Defesa",
        lessons: [
          {
            id: "fb-defesa-01",
            title: "01 - Introdução aos Conceitos de Defesa",
          },
          {
            id: "fb-defesa-02",
            title: "02 - Defesa de Chave de Braço (Armlock)",
          },
          { id: "fb-defesa-03", title: "03 - Defesa de Kimura" },
          { id: "fb-defesa-04", title: "04 - Saída do Estrangulamento" },
          { id: "fb-defesa-05", title: "05 - Saída da Guilhotina" },
          { id: "fb-defesa-06", title: "06 - Saída do Triângulo" },
          { id: "fb-defesa-07", title: "07 - Saída da Omoplata" },
        ],
      },
      {
        id: "fb-fundamentos",
        title: "Fundamentos",
        lessons: [
          { id: "fb-fund-01", title: "01 - Amortecimento de Queda" },
          { id: "fb-fund-02", title: "02 - Saída de Quadril 1" },
          { id: "fb-fund-03", title: "03 - Saída de Quadril 2" },
          { id: "fb-fund-04", title: "04 - Reposição de Guarda" },
          { id: "fb-fund-05", title: "05 - Barrigada (Upa)" },
          { id: "fb-fund-06", title: "06 - Rolamentos" },
        ],
      },
      {
        id: "fb-guarda-aranha",
        title: "Guarda Aranha",
        lessons: [
          { id: "fb-ga-01", title: "01 - Introdução à Guarda Aranha" },
          { id: "fb-ga-02", title: "02 - Raspagem 1" },
          { id: "fb-ga-03", title: "03 - Raspagem 2" },
          { id: "fb-ga-04", title: "04 - Finalização 1" },
          { id: "fb-ga-05", title: "05 - Finalização 2" },
          { id: "fb-ga-06", title: "06 - Passagem de Guarda 1" },
          { id: "fb-ga-07", title: "07 - Passagem de Guarda 2" },
          { id: "fb-ga-08", title: "08 - Reposição de Guarda" },
          { id: "fb-ga-09", title: "09 - Exercícios de Guarda Aranha" },
        ],
      },
      {
        id: "fb-guarda-dlr",
        title: "Guarda Dela Riva",
        lessons: [
          { id: "fb-dlr-01", title: "01 - Introdução à Guarda De La Riva" },
          { id: "fb-dlr-02", title: "02 - Raspagem 1" },
          { id: "fb-dlr-03", title: "03 - Raspagem 2" },
          { id: "fb-dlr-04", title: "04 - Raspagem 3" },
          { id: "fb-dlr-05", title: "05 - Passagem de Guarda 1" },
          { id: "fb-dlr-06", title: "06 - Passagem de Guarda 2" },
          { id: "fb-dlr-07", title: "07 - Passagem de Guarda 3" },
          { id: "fb-dlr-08", title: "08 - Exercícios de De La Riva" },
        ],
      },
      {
        id: "fb-guarda-fechada",
        title: "Guarda Fechada",
        lessons: [
          { id: "fb-gf-01", title: "01 - Introdução à Guarda Fechada" },
          { id: "fb-gf-02", title: "02 - Passagem de Guarda 1" },
          { id: "fb-gf-03", title: "03 - Passagem de Guarda 2" },
          { id: "fb-gf-04", title: "04 - Raspagem 1" },
          { id: "fb-gf-05", title: "05 - Raspagem 2" },
          { id: "fb-gf-06", title: "06 - Raspagem 3" },
          { id: "fb-gf-07", title: "07 - Finalização 1" },
          { id: "fb-gf-08", title: "08 - Finalização 2" },
          { id: "fb-gf-09", title: "09 - Finalização 3" },
          { id: "fb-gf-10", title: "10 - Finalização 4" },
          { id: "fb-gf-11", title: "11 - Finalização 5" },
          { id: "fb-gf-12", title: "12 - Exercícios de Guarda Fechada" },
        ],
      },
      {
        id: "fb-meia-guarda",
        title: "Guarda Meia-Guarda",
        lessons: [
          { id: "fb-mg-01", title: "01 - Introdução à Meia-Guarda" },
          { id: "fb-mg-02", title: "02 - Entendendo a Posição" },
          { id: "fb-mg-03", title: "03 - Defesa na Meia-Guarda" },
          { id: "fb-mg-04", title: "04 - Raspagem 1" },
          { id: "fb-mg-05", title: "05 - Transição" },
          { id: "fb-mg-06", title: "06 - Raspagem 2" },
          { id: "fb-mg-07", title: "07 - Raspagem 3" },
          { id: "fb-mg-08", title: "08 - Passagem de Meia-Guarda 1" },
          { id: "fb-mg-09", title: "09 - Passagem de Meia-Guarda 2" },
        ],
      },
      {
        id: "fb-guarda-sentada",
        title: "Guarda Sentada",
        lessons: [
          { id: "fb-gs-01", title: "01 - Introdução à Guarda Sentada" },
          { id: "fb-gs-02", title: "02 - Raspagem 1" },
          { id: "fb-gs-03", title: "03 - Raspagem 2" },
          { id: "fb-gs-04", title: "04 - Raspagem 3" },
          { id: "fb-gs-05", title: "05 - Passagem de Guarda 1" },
          { id: "fb-gs-06", title: "06 - Passagem de Guarda 2" },
          { id: "fb-gs-07", title: "07 - Finalização" },
        ],
      },
      {
        id: "fb-em-pe",
        title: "Luta em Pé",
        lessons: [
          { id: "fb-lp-01", title: "01 - Introdução à Luta em Pé" },
          { id: "fb-lp-02", title: "02 - Queda Single Leg" },
          { id: "fb-lp-03", title: "03 - Queda Osoto Gari" },
          { id: "fb-lp-04", title: "04 - Queda O Goshi" },
          { id: "fb-lp-05", title: "05 - Defesa de Double Leg" },
          { id: "fb-lp-06", title: "06 - Exercícios de Luta em Pé" },
        ],
      },
      {
        id: "fb-montada",
        title: "Montada",
        lessons: [
          { id: "fb-mont-01", title: "01 - Introdução à Montada" },
          { id: "fb-mont-02", title: "02 - Saída da Montada 1" },
          { id: "fb-mont-03", title: "03 - Saída da Montada 2" },
          { id: "fb-mont-04", title: "04 - Finalização 1" },
          { id: "fb-mont-05", title: "05 - Finalização 2" },
          { id: "fb-mont-06", title: "06 - Finalização 3" },
          { id: "fb-mont-07", title: "07 - Finalização 4" },
          { id: "fb-mont-08", title: "08 - Finalização 5" },
        ],
      },
      {
        id: "fb-solo-drills",
        title: "Solo Drills",
        lessons: [
          { id: "fb-sd-01", title: "01 - Entrada de Queda" },
          { id: "fb-sd-02", title: "02 - Sprawl" },
          { id: "fb-sd-03", title: "03 - Subida na Guarda Fechada 1" },
          { id: "fb-sd-04", title: "04 - Subida na Guarda Fechada 2" },
          { id: "fb-sd-05", title: "05 - Movimento de Kimura" },
          { id: "fb-sd-06", title: "06 - Movimento de Triângulo" },
          { id: "fb-sd-07", title: "07 - Pedalada" },
          { id: "fb-sd-08", title: "08 - Movimentação de Passagem" },
          { id: "fb-sd-09", title: "09 - Chute Lateral" },
          { id: "fb-sd-10", title: "10 - Subida em S" },
          { id: "fb-sd-11", title: "11 - Giro Lateral" },
          { id: "fb-sd-12", title: "12 - Subida de Raspagem" },
          { id: "fb-sd-13", title: "13 - Movimento de Armdrag" },
          { id: "fb-sd-14", title: "14 - Movimentação do Quadril" },
          { id: "fb-sd-15", title: "15 - Saída de Quadril" },
          { id: "fb-sd-16", title: "16 - Barrigada com Giro" },
        ],
      },
    ],
  },
  {
    id: "faixa-azul",
    title: "Faixa - Azul",
    sections: [
      {
        id: "fa-100kg",
        title: "100kg",
        lessons: [
          { id: "fa-100kg-01", title: "01 - Saída dos 100kg 1" },
          { id: "fa-100kg-02", title: "02 - Finalização: Estrangulamento 1" },
          { id: "fa-100kg-03", title: "03 - Finalização: Opções Diversas" },
          { id: "fa-100kg-04", title: "04 - Revisão de Transições" },
          { id: "fa-100kg-05", title: "05 - Finalização: Mão de Vaca" },
          { id: "fa-100kg-06", title: "06 - Finalização: Estrangulamento 2" },
          { id: "fa-100kg-07", title: "07 - Finalização: Estrangulamento 3" },
          { id: "fa-100kg-08", title: "08 - Saída dos 100kg 2" },
          { id: "fa-100kg-09", title: "09 - Como Sair do Imobilizado 1" },
          { id: "fa-100kg-10", title: "10 - Como Sair do Imobilizado 2" },
          { id: "fa-100kg-11", title: "11 - Saída Usando o Quadril" },
          { id: "fa-100kg-12", title: "12 - Saída Usando a Ponte" },
        ],
      },
      {
        id: "fa-costas-montada",
        title: "Costas Montada",
        lessons: [
          { id: "fa-cm-01", title: "01 - Transição para as Costas 1" },
          { id: "fa-cm-02", title: "02 - Transição para as Costas 2" },
          { id: "fa-cm-03", title: "03 - Transição para a Montada 1" },
          { id: "fa-cm-04", title: "04 - Transição para a Montada 2" },
          { id: "fa-cm-05", title: "05 - Saída da Montada 1" },
          { id: "fa-cm-06", title: "06 - Saída da Montada 2" },
          { id: "fa-cm-07", title: "07 - Finalização 1" },
          { id: "fa-cm-08", title: "08 - Finalização 2" },
          { id: "fa-cm-09", title: "09 - Finalização 3" },
        ],
      },
      {
        id: "fa-defesa",
        title: "Defesa",
        lessons: [
          { id: "fa-def-01", title: "01 - Saída do Triângulo" },
          { id: "fa-def-02", title: "02 - Saída da Kimura" },
          { id: "fa-def-03", title: "03 - Saída da Omoplata" },
          { id: "fa-def-04", title: "04 - Como Sobreviver no Sufoco" },
        ],
      },
      {
        id: "fa-em-pe",
        title: "Em pé",
        lessons: [
          { id: "fa-ep-01", title: "01 - Opções de Queda 1" },
          { id: "fa-ep-02", title: "02 - Variações de Queda" },
          { id: "fa-ep-03", title: "03 - Queda de Ashi Harai" },
          { id: "fa-ep-04", title: "04 - Queda Kouchi Gari" },
          { id: "fa-ep-05", title: "05 - Queda Koshi Guruma" },
          { id: "fa-ep-06", title: "06 - Catada de Perna" },
          { id: "fa-ep-07", title: "07 - Queda de Quadril" },
          { id: "fa-ep-08", title: "08 - Transição para Chamada de Guarda" },
          { id: "fa-ep-09", title: "09 - Finalização na Chamada de Guarda" },
          {
            id: "fa-ep-10",
            title: "10 - Chave de Braço Voadora (Flying Armlock)",
          },
          { id: "fa-ep-11", title: "11 - Guilhotina em Pé" },
          { id: "fa-ep-12", title: "12 - Mão de Vaca em Pé" },
        ],
      },
      {
        id: "fa-guarda-araha-laco",
        title: "Guarda Aranha Laço",
        lessons: [
          { id: "fa-gal-01", title: "01 - Comece Aqui: Conceitos do Laço" },
          { id: "fa-gal-02", title: "02 - Introdução à Guarda Laço" },
          { id: "fa-gal-03", title: "03 - Raspagem de Laço 1" },
          { id: "fa-gal-04", title: "04 - Raspagem de Laço 2" },
          { id: "fa-gal-05", title: "05 - Raspagem de Laço 3" },
          { id: "fa-gal-06", title: "06 - Raspagem de Laço 4" },
          { id: "fa-gal-07", title: "07 - Passagem de Guarda Laço 1" },
          { id: "fa-gal-08", title: "08 - Passagem de Guarda Laço 2" },
          { id: "fa-gal-09", title: "09 - Finalização de Laço 1" },
          { id: "fa-gal-10", title: "10 - Finalização de Laço 2" },
          { id: "fa-gal-11", title: "11 - Finalização de Laço 3" },
          { id: "fa-gal-12", title: "12 - Finalização de Laço 4" },
          { id: "fa-gal-13", title: "13 - Finalização de Laço 5" },
        ],
      },
      {
        id: "fa-guarda-dlr",
        title: "Guarda Dela Riva",
        lessons: [
          { id: "fa-dlr-01", title: "01 - Introdução à Guarda De La Riva" },
          { id: "fa-dlr-02", title: "02 - Raspagem 1" },
          { id: "fa-dlr-03", title: "03 - Raspagem 2" },
          { id: "fa-dlr-04", title: "04 - Raspagem 3" },
          { id: "fa-dlr-05", title: "05 - Raspagem 4" },
          { id: "fa-dlr-06", title: "06 - Passagem de Guarda 1" },
          { id: "fa-dlr-07", title: "07 - Passagem de Guarda 2" },
          { id: "fa-dlr-08", title: "08 - Defesa na De La Riva" },
          { id: "fa-dlr-09", title: "09 - Transição 1" },
          { id: "fa-dlr-10", title: "10 - Transição 2" },
          { id: "fa-dlr-11", title: "11 - Transição 3" },
        ],
      },
      {
        id: "fa-guarda-fechada",
        title: "Guarda Fechada",
        lessons: [
          { id: "fa-gf-01", title: "01 - Passagem de Guarda 1" },
          { id: "fa-gf-02", title: "02 - Passagem de Guarda 2" },
          { id: "fa-gf-03", title: "03 - Raspagem 1" },
          { id: "fa-gf-04", title: "04 - Raspagem 2" },
          { id: "fa-gf-05", title: "05 - Raspagem 3" },
          { id: "fa-gf-06", title: "06 - Raspagem 4" },
          { id: "fa-gf-07", title: "07 - Transição 1" },
          { id: "fa-gf-08", title: "08 - Transição 2" },
          { id: "fa-gf-09", title: "09 - Finalização 1" },
          { id: "fa-gf-10", title: "10 - Finalização 2" },
          { id: "fa-gf-11", title: "11 - Finalização 3" },
          { id: "fa-gf-12", title: "12 - Finalização 4" },
        ],
      },
      {
        id: "fa-meia-sentada",
        title: "Guarda Meia-Guarda-Sentada",
        lessons: [
          { id: "fa-mgs-01", title: "01 - Introdução à Meia-Guarda Sentada" },
          { id: "fa-mgs-02", title: "02 - Conceitos Iniciais" },
          { id: "fa-mgs-03", title: "03 - Defesa na Meia Sentada" },
          { id: "fa-mgs-04", title: "04 - Passagem de Meia Sentada 1" },
          { id: "fa-mgs-05", title: "05 - Passagem de Meia Sentada 2" },
          { id: "fa-mgs-06", title: "06 - Passagem de Meia Sentada 3" },
          { id: "fa-mgs-07", title: "07 - Raspagem 1" },
          { id: "fa-mgs-08", title: "08 - Raspagem 2" },
          { id: "fa-mgs-09", title: "09 - Raspagem 3" },
          { id: "fa-mgs-10", title: "10 - Raspagem 4" },
          { id: "fa-mgs-11", title: "11 - Finalização 1" },
          { id: "fa-mgs-12", title: "12 - Finalização 2" },
          { id: "fa-mgs-13", title: "13 - Defesa Avançada 1" },
          { id: "fa-mgs-14", title: "14 - Defesa Avançada 2" },
        ],
      },
      {
        id: "fa-guarda-x",
        title: "Guarda X",
        lessons: [
          { id: "fa-gx-01", title: "01 - Transição para Guarda X" },
          { id: "fa-gx-02", title: "02 - Introdução à Guarda X" },
          { id: "fa-gx-03", title: "03 - Comece Aqui: Posicionamento" },
          { id: "fa-gx-04", title: "04 - Comece Aqui: Equilíbrio" },
          { id: "fa-gx-05", title: "05 - Passagem de Guarda X" },
          { id: "fa-gx-06", title: "06 - Raspagem de Guarda X" },
          { id: "fa-gx-07", title: "07 - Finalização de Guarda X" },
          { id: "fa-gx-08", title: "08 - Transição para Outras Guardas 1" },
          { id: "fa-gx-09", title: "09 - Transição para Outras Guardas 2" },
        ],
      },
    ],
  },
  {
    id: "faixa-roxa",
    title: "Faixa - Roxa",
    sections: [
      {
        id: "fr-100kg",
        title: "100kg",
        lessons: [
          { id: "fr-100kg-01", title: "01 - Finalização: Triângulo 1" },
          { id: "fr-100kg-02", title: "02 - Finalização: Triângulo 2" },
          { id: "fr-100kg-03", title: "03 - Finalização: Triângulo 3" },
          { id: "fr-100kg-04", title: "04 - Finalização: Triângulo de Braço" },
          { id: "fr-100kg-05", title: "05 - Transição de Imobilização" },
          { id: "fr-100kg-06", title: "06 - Finalização: Estrangulamento 1" },
          { id: "fr-100kg-07", title: "07 - Finalização: Estrangulamento 2" },
          { id: "fr-100kg-08", title: "08 - Finalização: Variação" },
        ],
      },
      {
        id: "fr-costas-montada",
        title: "Costas Montada",
        lessons: [
          { id: "fr-cm-01", title: "01 - Saída da Montada" },
          { id: "fr-cm-02", title: "02 - Finalização 1" },
          { id: "fr-cm-03", title: "03 - Transição para as Costas" },
          { id: "fr-cm-04", title: "04 - Finalização 2" },
          { id: "fr-cm-05", title: "05 - Finalização 3" },
          { id: "fr-cm-06", title: "06 - Finalização 4" },
        ],
      },
      {
        id: "fr-defesa",
        title: "Defesa",
        lessons: [
          { id: "fr-def-01", title: "01 - Saída do Triângulo" },
          { id: "fr-def-02", title: "02 - Defesa Alternativa" },
          { id: "fr-def-03", title: "03 - Contra-Ataque de Defesa" },
          { id: "fr-def-04", title: "04 - Saída da Kimura" },
          { id: "fr-def-05", title: "05 - Escapando da Omoplata" },
          { id: "fr-def-06", title: "06 - Anulando o Ataque 1" },
          { id: "fr-def-07", title: "07 - Anulando o Ataque 2" },
        ],
      },
      {
        id: "fr-em-pe",
        title: "Em pé",
        lessons: [
          { id: "fr-ep-01", title: "01 - Queda de Arm Drag" },
          { id: "fr-ep-02", title: "02 - Queda Kataguruma" },
          { id: "fr-ep-03", title: "03 - Queda Seoi Nage" },
          { id: "fr-ep-04", title: "04 - Contra-Ataque de Queda" },
          { id: "fr-ep-05", title: "05 - Defesa de Single Leg 1" },
          { id: "fr-ep-06", title: "06 - Defesa de Single Leg 2" },
          { id: "fr-ep-07", title: "07 - Contra-Ataque de Single Leg" },
          { id: "fr-ep-08", title: "08 - Transição do Single Leg" },
          { id: "fr-ep-09", title: "09 - Passagem com Antecipação" },
        ],
      },
      {
        id: "fr-guarda-dlr",
        title: "Guarda Dela Riva",
        lessons: [
          { id: "fr-dlr-01", title: "01 - Raspagem 1" },
          { id: "fr-dlr-02", title: "02 - Raspagem 2" },
          { id: "fr-dlr-03", title: "03 - Passagem de Guarda 1" },
          { id: "fr-dlr-04", title: "04 - Passagem de Guarda 2" },
          { id: "fr-dlr-05", title: "05 - Passagem de Guarda 3" },
          { id: "fr-dlr-06", title: "06 - Passagem de Guarda 4" },
        ],
      },
      {
        id: "fr-guarda-fechada",
        title: "Guarda Fechada",
        lessons: [
          { id: "fr-gf-01", title: "01 - Passagem de Guarda" },
          { id: "fr-gf-02", title: "02 - Raspagem" },
          { id: "fr-gf-03", title: "03 - Finalização 1" },
          { id: "fr-gf-04", title: "04 - Finalização 2" },
          { id: "fr-gf-05", title: "05 - Finalização 3" },
          { id: "fr-gf-06", title: "06 - Finalização 4" },
          { id: "fr-gf-07", title: "07 - Finalização 5" },
          { id: "fr-gf-08", title: "08 - Finalização 6" },
        ],
      },
      {
        id: "fr-guarda-laco",
        title: "Guarda Laço",
        lessons: [
          { id: "fr-gl-01", title: "01 - Opções de Raspagem de Laço" },
          { id: "fr-gl-02", title: "02 - Defesa de Raspagem de Laço" },
          { id: "fr-gl-03", title: "03 - Opções de Defesa no Laço" },
          { id: "fr-gl-04", title: "04 - Retenção de Guarda no Laço" },
          { id: "fr-gl-05", title: "05 - Finalização no Laço" },
          { id: "fr-gl-06", title: "06 - Passagem de Guarda Laço 1" },
          { id: "fr-gl-07", title: "07 - Passagem de Guarda Laço 2" },
          { id: "fr-gl-08", title: "08 - Passagem de Guarda Laço 3" },
          { id: "fr-gl-09", title: "09 - Passagem de Guarda Laço 4" },
          { id: "fr-gl-10", title: "10 - Transição no Laço" },
        ],
      },
      {
        id: "fr-meia-guarda",
        title: "Guarda Meia-Guarda",
        lessons: [
          { id: "fr-mg-01", title: "01 - Transição na Meia Sentada" },
          { id: "fr-mg-02", title: "02 - Raspagem 1" },
          { id: "fr-mg-03", title: "03 - Raspagem 2" },
          { id: "fr-mg-04", title: "04 - Raspagem 3" },
          { id: "fr-mg-05", title: "05 - Raspagem 4" },
          { id: "fr-mg-06", title: "06 - Raspagem 5" },
          { id: "fr-mg-07", title: "07 - Passagem de Meia Sentada 1" },
          { id: "fr-mg-08", title: "08 - Passagem de Meia Sentada 2" },
          { id: "fr-mg-09", title: "09 - Passagem de Meia Sentada 3" },
          { id: "fr-mg-10", title: "10 - Finalização 1" },
          { id: "fr-mg-11", title: "11 - Finalização 2" },
          { id: "fr-mg-12", title: "12 - Finalização 3" },
        ],
      },
      {
        id: "fr-guarda-x",
        title: "Guarda X",
        lessons: [
          { id: "fr-gx-01", title: "01 - Transição para Guarda X" },
          { id: "fr-gx-02", title: "02 - Transição da Meia para X" },
          { id: "fr-gx-03", title: "03 - Entrada na Guarda X" },
          { id: "fr-gx-04", title: "04 - Raspagem Pêndulo" },
          { id: "fr-gx-05", title: "05 - Passagem Abrindo a Guarda" },
          { id: "fr-gx-06", title: "06 - Passagem de Guarda 1" },
          { id: "fr-gx-07", title: "07 - Passagem de Guarda 2" },
          { id: "fr-gx-08", title: "08 - Defesa e Retenção" },
          { id: "fr-gx-09", title: "09 - Transição Avançada 1" },
          { id: "fr-gx-10", title: "10 - Transição Avançada 2" },
          { id: "fr-gx-11", title: "11 - Passagem de Leg Drag" },
          { id: "fr-gx-12", title: "12 - Transição Avançada 3" },
          { id: "fr-gx-13", title: "13 - Entrada na One Leg X" },
        ],
      },
    ],
  },
  {
    id: "faixa-marrom",
    title: "Faixa - Marrom",
    sections: [
      {
        id: "fm-5050",
        title: "5050",
        lessons: [
          {
            id: "fm-5050-01",
            title: "01 - Transição da Meia-Guarda para 50-50",
          },
          { id: "fm-5050-02", title: "02 - Desfazendo a Guarda 50-50" },
        ],
      },
      {
        id: "fm-costas",
        title: "Costas",
        lessons: [
          {
            id: "fm-costas-01",
            title: "01 - Opção de Transição para as Costas",
          },
          {
            id: "fm-costas-02",
            title: "02 - Transição para Pegada de Costas 1",
          },
          {
            id: "fm-costas-03",
            title: "03 - Transição para Pegada de Costas 2",
          },
          { id: "fm-costas-04", title: "04 - Defesa do Controle de Costas" },
          { id: "fm-costas-05", title: "05 - Finalização: Chave de Braço" },
        ],
      },
      {
        id: "fm-defesa",
        title: "Defesa",
        lessons: [
          { id: "fm-def-01", title: "01 - Defesa de Americana" },
          { id: "fm-def-02", title: "02 - Defesa de Chave de Braço" },
          { id: "fm-def-03", title: "03 - Saída do Sufoco" },
          { id: "fm-def-04", title: "04 - Escapando da Finalização" },
        ],
      },
      {
        id: "fm-dlr",
        title: "Guarda Dela Riva",
        lessons: [
          { id: "fm-dlr-01", title: "01 - Transição na De La Riva 1" },
          { id: "fm-dlr-02", title: "02 - Transição na De La Riva 2" },
          { id: "fm-dlr-03", title: "03 - Finalização na De La Riva" },
        ],
      },
      {
        id: "fm-laco",
        title: "Guarda Laço",
        lessons: [
          { id: "fm-laco-01", title: "01 - Raspagem de Laço 1" },
          { id: "fm-laco-02", title: "02 - Raspagem de Laço 2" },
          { id: "fm-laco-03", title: "03 - Passagem de Guarda Laço 1" },
          { id: "fm-laco-04", title: "04 - Passagem de Guarda Laço 2" },
        ],
      },
      {
        id: "fm-gx",
        title: "Guarda X",
        lessons: [
          { id: "fm-gx-01", title: "01 - Raspagem Balão" },
          { id: "fm-gx-02", title: "02 - Raspagem Joga para Longe" },
          { id: "fm-gx-03", title: "03 - Finalização 1" },
          { id: "fm-gx-04", title: "04 - Finalização 2" },
          { id: "fm-gx-05", title: "05 - Finalização 3" },
        ],
      },
      {
        id: "fm-meia-guarda",
        title: "Meia Guarda",
        lessons: [
          { id: "fm-mg-01", title: "01 - Transição na Meia-Guarda 1" },
          { id: "fm-mg-02", title: "02 - Transição na Meia-Guarda 2" },
          { id: "fm-mg-03", title: "03 - Raspagem de Meia-Guarda 1" },
          { id: "fm-mg-04", title: "04 - Raspagem de Meia-Guarda 2" },
          { id: "fm-mg-05", title: "05 - Finalização na Meia-Guarda" },
        ],
      },
    ],
  },
  {
    id: "faixa-preta",
    title: "Faixa - Preta",
    sections: [
      {
        id: "fp-5050",
        title: "Guarda 5050",
        lessons: [{ id: "fp-5050-01", title: "01 - Finalização na 50-50" }],
      },
      {
        id: "fp-dlr",
        title: "Guarda Dela Riva",
        lessons: [
          { id: "fp-dlr-01", title: "01 - Transição na De La Riva 1" },
          { id: "fp-dlr-02", title: "02 - Transição na De La Riva 2" },
          { id: "fp-dlr-03", title: "03 - Finalização 1" },
          { id: "fp-dlr-04", title: "04 - Finalização 2" },
        ],
      },
      {
        id: "fp-lapela",
        title: "Guarda Lapela",
        lessons: [{ id: "fp-lapela-01", title: "01 - Raspagem de Lapela" }],
      },
      {
        id: "fp-gx",
        title: "Guarda X",
        lessons: [
          { id: "fp-gx-01", title: "01 - Transição para Leg Drag" },
          { id: "fp-gx-02", title: "02 - Finalização na Guarda X" },
        ],
      },
      {
        id: "fp-mg",
        title: "Meia Guarda",
        lessons: [
          { id: "fp-mg-01", title: "01 - Finalização 1" },
          { id: "fp-mg-02", title: "02 - Finalização 2" },
          { id: "fp-mg-03", title: "03 - Finalização 3" },
        ],
      },
    ],
  },
];

const ROADMAP_ORDER = [
  "intro",
  "ferramentas",
  "regras",
  "faixa-branca",
  "faixa-azul",
  "faixa-roxa",
  "faixa-marrom",
  "faixa-preta",
  "drills",
  "condicionamento",
  "nutricao",
  "preparacao-fisica",
  "mentalidade",
];

const STORAGE_KEY = "jiu-course-progress";

const collectLessons = (sections: Section[]): Lesson[] =>
  sections.flatMap((section) => {
    const direct = section.lessons ?? [];
    const nested = section.sections ? collectLessons(section.sections) : [];
    return [...direct, ...nested];
  });

const filterSections = (sections: Section[], query: string): Section[] => {
  if (!query) return sections;
  const q = query.toLowerCase();

  const filterSection = (section: Section): Section | null => {
    const lessons = (section.lessons ?? []).filter((lesson) =>
      lesson.title.toLowerCase().includes(q),
    );

    const childSections = (section.sections ?? [])
      .map(filterSection)
      .filter(Boolean) as Section[];

    if (lessons.length === 0 && childSections.length === 0) return null;

    return {
      ...section,
      lessons,
      sections: childSections,
    };
  };

  return sections.map(filterSection).filter(Boolean) as Section[];
};

const orderSections = (sections: Section[]) => {
  const indexMap = new Map(ROADMAP_ORDER.map((id, index) => [id, index]));

  return [...sections].sort((a, b) => {
    const aIndex = indexMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = indexMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
};

const App = () => {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProgress(JSON.parse(raw));
      } catch {
        setProgress({});
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const orderedCourse = useMemo(() => orderSections(COURSE), []);
  const allLessons = useMemo(
    () => collectLessons(orderedCourse),
    [orderedCourse],
  );
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => progress[l.id]).length;
  const percent = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  const visibleSections = useMemo(() => {
    let sections = filterSections(orderedCourse, query);
    if (!showCompletedOnly) return sections;

    const filterCompleted = (section: Section): Section | null => {
      const lessons = (section.lessons ?? []).filter(
        (lesson) => progress[lesson.id],
      );
      const childSections = (section.sections ?? [])
        .map(filterCompleted)
        .filter(Boolean) as Section[];
      if (lessons.length === 0 && childSections.length === 0) return null;
      return { ...section, lessons, sections: childSections };
    };

    return sections.map(filterCompleted).filter(Boolean) as Section[];
  }, [query, showCompletedOnly, progress]);

  const toggleLesson = (lessonId: string) => {
    setProgress((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const markSection = (section: Section, value: boolean) => {
    const lessons = collectLessons([section]);
    setProgress((prev) => {
      const next = { ...prev };
      lessons.forEach((lesson) => {
        next[lesson.id] = value;
      });
      return next;
    });
  };

  const getSectionProgress = (section: Section) => {
    const lessons = collectLessons([section]);
    const done = lessons.filter((l) => progress[l.id]).length;
    return { done, total: lessons.length };
  };

  const renderSection = (section: Section, level: number) => {
    const { done, total } = getSectionProgress(section);
    const titleStyle = {
      fontSize: level === 0 ? "1.4rem" : level === 1 ? "1.2rem" : "1rem",
      margin: "0 0 0.25rem 0",
    };

    return (
      <details
        key={section.id}
        open={expandAll || level === 0}
        style={{ marginBottom: "1rem" }}
      >
        <summary
          style={{
            listStyle: "none",
            cursor: "pointer",
            padding: "0.5rem 0",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <h3 style={titleStyle}>{section.title}</h3>
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              {done}/{total} concluídos
            </span>
          </div>
        </summary>

        <div style={{ paddingLeft: level === 0 ? "0.75rem" : "1.25rem" }}>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              margin: "0.5rem 0 0.75rem",
            }}
          >
            <button onClick={() => markSection(section, true)}>
              Marcar seção
            </button>
            <button onClick={() => markSection(section, false)}>
              Desmarcar seção
            </button>
          </div>

          {section.lessons && section.lessons.length > 0 && (
            <ul
              style={{ listStyle: "none", padding: 0, margin: "0 0 0.75rem 0" }}
            >
              {section.lessons.map((lesson) => (
                <li key={lesson.id} style={{ marginBottom: "0.5rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!progress[lesson.id]}
                      onChange={() => toggleLesson(lesson.id)}
                    />
                    <span
                      style={{
                        textDecoration: progress[lesson.id]
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {lesson.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {section.sections &&
            section.sections.map((child) => renderSection(child, level + 1))}
        </div>
      </details>
    );
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>
          Roadmap do Curso - Manual do Jiu-Jitsu
        </h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          Checklist completo com barra de progresso. Comece pelas faixas
          iniciais e avance até a faixa preta.
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 999,
            height: 12,
            overflow: "hidden",
            marginTop: "0.75rem",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7c3aed, #22c55e)",
            }}
          />
        </div>
        <div style={{ marginTop: "0.5rem", fontSize: "0.95rem", opacity: 0.9 }}>
          {completedLessons}/{totalLessons} aulas concluídas • {percent}%
        </div>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aula ou seção..."
            style={{
              flex: "1 1 240px",
              padding: "0.6rem 0.75rem",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
            }}
          />
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              checked={showCompletedOnly}
              onChange={() => setShowCompletedOnly((prev) => !prev)}
            />
            Mostrar somente concluídas
          </label>
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              checked={expandAll}
              onChange={() => setExpandAll((v) => !v)}
            />
            Expandir tudo
          </label>
          <button onClick={() => setProgress({})}>Resetar progresso</button>
        </div>
      </section>

      <main>{visibleSections.map((section) => renderSection(section, 0))}</main>
    </div>
  );
};

export default App;
