import program, { Command } from 'commander';

const wolf = String.raw`
                     .
                    / V\
                  / '  /
                 <<   |
                 /    |
               /      |
             /        |
           /    \  \ /
          (      ) | |
  ________|   _/_  | |
<__________\______)\__)
`;

export const buildHowlCommand = (): program.Command => {
  const command = new Command('howl')
    .description('🐺')
    .action(() => console.log(wolf));

  return command;
};
