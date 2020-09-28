import { Package } from "@manuth/package-json-editor";
import { join } from "upath";

/**
 * Provides constants for the package.
 */
export abstract class Constants
{
    /**
     * The path to the directory of this package.
     */
    public static readonly PackageDirectory = join(__dirname, "..");

    /**
     * The `package.json` file.
     */
    public static readonly Package = new Package(join(Constants.PackageDirectory, "package.json"));
}
