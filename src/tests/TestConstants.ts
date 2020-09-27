import { join } from "upath";

/**
 * Provides constants for the end-to-end tests.
 */
export class TestConstants
{
    /**
     * Gets the path to the directory of this package.
     */
    public static readonly PackageDirectory = join(__dirname, "..", "..", "test");
}
