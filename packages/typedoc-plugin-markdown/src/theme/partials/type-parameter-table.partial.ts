import { TypeParameterReflection } from 'typedoc';
import { MarkdownThemeRenderContext } from '../theme.context';
import { stripLineBreaks } from '../utils/format';

export function typeParameterTablePartial(
  context: MarkdownThemeRenderContext,
  props: TypeParameterReflection[],
) {
  function table(parameters: any) {
    const showTypeCol = hasTypes(parameters);
    const comments = parameters.map(
      (param) =>
        !!param.comment?.text?.trim() || !!param.comment?.shortText?.trim(),
    );
    const hasComments = !comments.every((value) => !value);

    const headers = ['Name'];

    if (showTypeCol) {
      headers.push('Type');
    }

    if (hasComments) {
      headers.push('Description');
    }

    const rows = parameters.map((parameter) => {
      const row: string[] = [];

      row.push(`\`${parameter.name}\``);

      if (showTypeCol) {
        const typeCol: string[] = [];
        if (!parameter.type && !parameter.default) {
          typeCol.push(`\`${parameter.name}\``);
        }
        if (parameter.type) {
          typeCol.push(
            `extends ${context.typePartial(parameter.type, 'object')}`,
          );
        }
        if (parameter.default) {
          if (parameter.type) {
            typeCol.push(' = ');
          }
          typeCol.push(context.typePartial(parameter.default));
        }
        row.push(typeCol.join(''));
      }

      if (hasComments) {
        if (parameter.comment) {
          row.push(
            stripLineBreaks(context.commentPartial(parameter.comment)).replace(
              /\|/g,
              '\\|',
            ),
          );
        } else {
          row.push('-');
        }
      }
      return `| ${row.join(' | ')} |\n`;
    });

    const output = `\n| ${headers.join(' | ')} |\n| ${headers
      .map(() => ':------')
      .join(' | ')} |\n${rows.join('')}`;
    return output;
  }

  function hasTypes(parameters: TypeParameterReflection[]) {
    const types = (parameters as TypeParameterReflection[]).map(
      (param) => !!param.type || !!param.default,
    );
    return !types.every((value) => !value);
  }

  return table(props);
}