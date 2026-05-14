import {
  createFormHook,
  createFormHookContexts,
  formOptions,
} from "@tanstack/react-form";

import type { Config } from "@repo/config";
import { ConfigSchema } from "@repo/config";

const EMPTY_CONFIG_FORM_VALUES: Config = {
  routines: [],
};

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const configFormOpts = formOptions({
  defaultValues: EMPTY_CONFIG_FORM_VALUES,
  validators: {
    onSubmit: ConfigSchema,
  },
});

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {},
  formComponents: {},
  fieldContext,
  formContext,
});
