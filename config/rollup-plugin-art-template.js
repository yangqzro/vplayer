import { createFilter } from "rollup-pluginutils";
import { compile } from "art-template";

const defaultCompilerOptions = {  };

export default function artTemplatePlugin({ include, exclude, options = {} } = {}) {
    const filter = createFilter(include || "**/*.art", exclude);

    return {
        name: "art-template",
        transform(code, filename) {
            if (!filter(filename)) return null;

            return {
                code: `
                    import $imports from "art-template/lib/runtime";
                    export default ${compile(code, Object.assign(options, defaultCompilerOptions)).toString()};
                `,
                map: { mappings: "" },
            };
        },
    };
}
