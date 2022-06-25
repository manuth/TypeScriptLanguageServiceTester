import { fileURLToPath } from "url";
import { Package } from "@manuth/package-json-editor";
import upath from "upath";

const { join } = upath;

/**
 * Provides constants for the package.
 */
export abstract class Constants
{
    /**
     * The path to the directory of this package.
     */
    public static readonly PackageDirectory = join(fileURLToPath(new URL(".", import.meta.url)), "..");

    /**
     * The `package.json` file.
     */
    public static get Package(): Package
    {
        return new Package(join(Constants.PackageDirectory, Package.FileName));
    }
}
