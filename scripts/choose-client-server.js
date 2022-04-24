#!/usr/bin/env node

const prompts = require("prompts");
const { spawn } = require("child_process");

const clients = [{ title: "React", command: "yarn dev:client-react" }];

const servers = [
  { title: "Node", command: "yarn dev:server-node" },
  { title: "Spring", command: "yarn dev:server-spring" },
];

(async () => {
  const response = await prompts([
    {
      type: "select",
      name: "client",
      message: "Please, inform which client you would like to use",
      choices: clients.map((client, idx) => ({
        title: client.title,
        value: idx,
      })),
    },
    {
      type: "select",
      name: "server",
      message: "Please, inform which server you would like to use",
      choices: servers.map((server, idx) => ({
        title: server.title,
        value: idx,
      })),
    },
  ]);

  const client = clients[response.client];
  const server = servers[response.server];

  const command = "concurrently";
  const args = [
    "-n",
    "client,server",
    "-c",
    "blue,green",
    "--kill-others",
    "--kill-others-on-fail",
    `\"${client.command}\"`,
    `\"${server.command}\"`,
  ];

  spawn(command, args, {
    shell: true,
    stdio: "inherit",
  });
})();
