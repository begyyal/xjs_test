import { T_U } from "./t-u";

// todo: consider for self testing.
(async () => {
    console.time("total time");
    for (const u of [
        T_U
    ]) await u.exe();
    console.timeEnd("total time");
})().catch((e: Error) => {
    console.error(e);
    process.exit(1);
});
