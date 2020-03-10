module.exports = {
  get_started: [
    { type: 'doc', id: 'what_is_qa_wolf' },
    {
      type: 'doc',
      id: 'install',
    },
    {
      type: 'doc',
      id: 'create_a_test',
    },
    {
      type: 'doc',
      id: 'run_tests_locally',
    },
    { type: 'doc', id: 'run_tests_in_ci' },
  ],
  guides: [
    { type: 'doc', id: 'use_the_repl' },
    { type: 'doc', id: 'add_assertions' },
    { type: 'doc', id: 'use_custom_selectors' },
    { type: 'doc', id: 'change_input_values' },
    { type: 'doc', id: 'emulate_a_device' },
    { type: 'doc', id: 'use_typescript' },
    { type: 'doc', id: 'create_a_script' },
    {
      type: 'category',
      label: 'Advanced',
      items: ['how_it_works', 'contribute'],
    },
  ],
  api: [
    { type: 'doc', id: 'api/table_of_contents' },
    { type: 'doc', id: 'api/cli' },
    {
      type: 'doc',
      id: 'api/environment_variables',
    },
    {
      type: 'category',
      label: 'module: qawolf',
      items: [
        'api/qawolf/create',
        'api/qawolf/launch',
        'api/qawolf/register',
        'api/qawolf/repl',
        'api/qawolf/save_state',
        'api/qawolf/scroll',
        'api/qawolf/set_state',
        'api/qawolf/wait_for_page',
      ],
    },
  ],
};
