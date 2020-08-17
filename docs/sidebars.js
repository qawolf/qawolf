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
    { type: 'doc', id: 'configure_qa_wolf' },
  ],
  guides: [
    { type: 'doc', id: 'edit_a_test' },
    // TODO merge into edit
    { type: 'doc', id: 'use_the_repl' },
    { type: 'doc', id: 'handle_sign_in' },
    { type: 'doc', id: 'use_custom_selectors' },
    // TODO move into create or edit?
    { type: 'doc', id: 'change_input_values' },
    { type: 'doc', id: 'emulate_a_device' },
    { type: 'doc', id: 'contribute' },
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
        'api/qawolf/assert_element_text',
        'api/qawolf/create',
        'api/qawolf/launch',
        'api/qawolf/register',
        'api/qawolf/repl',
        'api/qawolf/save_state',
        'api/qawolf/scroll',
        'api/qawolf/set_state',
        'api/qawolf/stop_videos',
        'api/qawolf/wait_for_page',
      ],
    },
  ],
};
