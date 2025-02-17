import { IContextVariables } from "../../stringai/types";


// In this case, defaultdict(string) means that any missing key will default to an empty string ("") when accessed. It will not throw erorr.

export function createDefaultDict(
    defaultValue: string,
    initialData: IContextVariables = {}
): IContextVariables {
    return new Proxy(initialData, {
        get(target, key: string) {
            return key in target ? target[key] : defaultValue;
        },
    });
}