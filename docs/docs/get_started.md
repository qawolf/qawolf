---
id: get_started
title: 🏃 Get Started
---

In this tutorial we make sure that you have the necessary understanding and environment setup before installing QA Wolf.

## Understand the command line

QA Wolf uses the command line interface (CLI) to create and run browser tests and scripts. Before moving on, make sure you:

- have a [basic understanding of the command line](https://guide.freecodecamp.org/linux/the-command-prompt)
- have found and opened up the CLI for your computer (instructions for [Mac](https://www.idownloadblog.com/2019/04/19/ways-open-terminal-mac/), [Windows](https://www.lifewire.com/how-to-open-command-prompt-2618089), and [Linux](https://www.howtogeek.com/140679/beginner-geek-how-to-start-using-the-linux-terminal/))

## Install Node.js and npm

Node.js is an environment that can execute [JavaScript](https://www.javascript.com/) code. QA Wolf is a [Node.js](https://nodejs.org/en/) library and requires that you have Node.js installed to run. [`npm`](https://www.npmjs.com/) comes bundled with Node.js and stands for [Node Package Manager](https://www.npmjs.com/). It helps manage the packages that your project needs to run.

[Follow these instructions to download and install Node.js and `npm`.](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

To confirm that you have Node.js and `npm` installed, run the following commands in the CLI:

```bash
node -v
npm -v
```

## Optional: Install Git

[Git](https://git-scm.com/) is a version control system for tracking changes in source code during software development. While not explicitly necessary to run QA Wolf, Git simplifies the process of adding your browser tests or scripts to a shared code base. It is also required to run your tests in CI.

The following resources will help you:

- [get a basic understanding of Git](https://guide.freecodecamp.org/git)
- [install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## Optional: Understand JavaScript

[JavaScript](https://www.javascript.com/) is the most widely used scripting language in the world. QA Wolf is written in JavaScript (specifically [TypeScript](https://www.typescriptlang.org), a typed superset of JavaScript). When you use QA Wolf to create a browser test or script, JavaScript code is generated. You don't need to edit or even understand this code to run your test or script.

However, having a basic understanding of JavaScript will give you more flexibility to tailor the generated code to your use case. It will also help you better debug when things aren't working. Many of these tutorials will touch on the generated code, and give you options for how to edit it.

If you'd like to learn the basics of JavaScript, [Codecademy has a free JavaScript tutorial](https://www.codecademy.com/learn/introduction-to-javascript), and [freeCodeCamp has an extensive list of resources](https://guide.freecodecamp.org/javascript/additional-javascript-resources).

## Install QA Wolf

With the setup out of the way, let's get started with QA Wolf!

QA Wolf is installed as a [dev dependency](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file) in your project. Dev dependencies are packages that are only needed for local development and testing.

To install QA Wolf, either create a new [Node.js](https://nodejs.org/en/) project or change directories into an existing one. To create a new project, run the following in the command line:

```bash
mkdir my-awesome-project
cd my-awesome-project
npm init -y
```

Once you're in your project directory, run the following to install `qawolf` as a dev dependency:

```bash
npm install --save-dev qawolf
```

After the installation is complete, run the following to make sure it was successful:

```bash
npx qawolf howl
```

Congratulations - you're now ready to create browser tests and scripts with QA Wolf! 🎉
