module.exports = {
  docs: [
    {
      type: "category",
      label: "Overview",
      items: ["what_is_qa_wolf", "how_it_works"]
    },
    {
      type: "doc",
      id: "install"
    },
    {
      type: "category",
      label: "Create Tests",
      items: [
        "your_first_test",
        "run_tests_locally",
        "review_test_code",
        "edit_test_code",
        "handle_sign_in",
        "emulate_a_device",
        "use_typescript"
      ]
    },
    { type: "doc", id: "run_tests_in_ci" },
    {
      type: "doc",
      id: "contribute"
    }
  ],
  api: [
    { type: "category", label: "CLI", items: [] },
    {
      type: "category",
      label: "Environment Variables",
      items: ["qaw_artifact_path"]
    },
    { type: "category", label: "Actions", items: [] },
    { type: "category", label: "Helpers", items: [] }
  ]
};
