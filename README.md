# forja

## 🟠 Sobre o projeto

**forja** — progressive overload, sem enrolação — é um web app focado em **progressive overload inteligente**. A ideia é simples: acompanhar treinos de forma objetiva, calcular evolução real de força e evitar progressões irreais ou mal interpretadas.

O design é limpo, moderno e caloroso: cinza quente e laranja, com toques de preto, tipografia clara para o dia a dia e números em monoespaçada só onde importa (peso, reps, datas) — nada de estética de terminal.

Esta é a **primeira versão funcional** do app, já utilizável no dia a dia, com melhorias e novas funcionalidades planejadas.

---

## 🧠 Conceito e lógica

Diferente de apps que analisam apenas carga ou repetições isoladas, o forja trabalha com **volume total baseado em força estimada**.

### 🔢 Algoritmo

* Utiliza a **Fórmula de Epley** para estimar o 1RM em cada série:

  `1RM = peso × (1 + reps / 30)`

* O **volume do exercício** é a soma dos 1RM estimados de todas as séries.

* A progressão é avaliada **comparando o mesmo exercício com o último treino**, considerando:

  * Carga
  * Repetições
  * Número de séries

Isso permite:

* Priorizar progressões consistentes
* Limitar aumentos artificiais de volume
* Ter uma leitura mais fiel da evolução ao longo do tempo

---

## 🎯 Objetivo do app

* Servir como um **caderno de treinos inteligente**
* Ajudar no controle de força e volume
* Incentivar progressão sustentável
* Evitar decisões ruins baseadas em métricas isoladas

---

## 🚧 Status do projeto

* ✅ Primeira versão lançada
* ⚠️ Uso individual (sem sistema de login público)
* 🔧 Em desenvolvimento contínuo

Funcionalidades futuras planejadas:

* Sistema de login
* Histórico mais detalhado
* Melhor visualização de progressão
* Ajustes finos no algoritmo

---

## 🛠️ Tecnologias

* HTML
* CSS
* JavaScript

---

# forja (English)

## 🟠 About the project

**forja** — progressive overload, no fluff — is a web app focused on **intelligent progressive overload**. The goal is to track workouts objectively, calculate real strength progression, and avoid misleading or unrealistic increases.

The design is clean, modern and warm: warm greys and orange, with black accents, friendly typography for everyday text, and monospaced numerals only where it matters (weight, reps, dates) — no terminal aesthetic.

This is the **first functional release**, already usable in real training routines, with continuous improvements planned.

---

## 🧠 Concept & logic

Unlike apps that track only weight or reps, forja works with **total volume based on estimated strength**.

### 🔢 Algorithm

* Uses the **Epley Formula** to estimate 1RM for each set:

  `1RM = weight × (1 + reps / 30)`

* The **exercise volume** is the sum of estimated 1RM from all sets.

* Progression is measured by **comparing the same exercise to the previous workout**, taking into account:

  * Weight
  * Repetitions
  * Number of sets

This approach:

* Prioritizes consistent progression
* Limits artificial volume spikes
* Provides a more realistic view of long-term progress

---

## 🎯 App goals

* Act as a **smart workout logbook**
* Help track strength and volume
* Encourage sustainable progression
* Prevent bad decisions based on isolated metrics

---

## 🚧 Project status

* ✅ First version released
* ⚠️ Individual use (no public signup yet)
* 🔧 Under active development

Planned features:

* Login system
* Deeper workout history
* Better progression visualization
* Algorithm fine-tuning

---

## 🛠️ Tech stack

* HTML
* CSS
* JavaScript

