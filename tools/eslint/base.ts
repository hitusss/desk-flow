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
        "perfectionist/sort-imports": [
          "error",
          {
            groups: [
              "type-import",
              ["type-internal", "type-parent", "type-sibling", "type-index"],
              { newlinesBetween: 1 },
              "value-builtin",
              "value-external",
              { newlinesBetween: 1 },
              "repo",
              { newlinesBetween: 1 },
              "value-internal",
              ["value-parent", "value-sibling", "value-index"],
              { newlinesBetween: 1 },
              "side-effect",
              "ts-equals-import",
              "unknown",
            ],
            customGroups: [
              {
                groupName: "repo",
                elementNamePattern: ["^@repo/.*"],
              },
            ],
            newlinesBetween: 0,
            newlinesInside: 0,
            order: "asc",
            type: "natural",
          },
        ],
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
