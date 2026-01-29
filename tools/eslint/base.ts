import antfu from "@antfu/eslint-config";

export default function config({
  options,
  config,
}: {
  options?: Parameters<typeof antfu>[0];
  config?: Parameters<typeof antfu>[1];
}): any {
  return antfu(
    {
      type: "app",
      typescript: true,
      react: true,
      formatters: false,
      stylistic: false,
      ...options,
    },
    {
      rules: {
        "unicorn/filename-case": [
          "error",
          {
            case: "kebabCase",
            ignore: ["README.md"],
          },
        ],
      },
      ...config,
    },
  );
}
