import assert from "node:assert";
import { describe, it } from "node:test";
import { createDebouncedWatcher } from "../dist/cli/watch.js";

// The file system watching itself (fs.watch) behaves differently per platform and is not
// tested here. The debounce is the part with logic, and mock timers make it deterministic.
describe("Watch debounce", () => {
  it("does not fire before 100 ms have passed", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const calls = [];
    const trigger = createDebouncedWatcher((file) => calls.push(file));

    trigger("a.cv.json");
    t.mock.timers.tick(99);

    assert.deepStrictEqual(calls, []);
  });

  it("fires once after 100 ms", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const calls = [];
    const trigger = createDebouncedWatcher((file) => calls.push(file));

    trigger("a.cv.json");
    t.mock.timers.tick(100);
    t.mock.timers.tick(1000);

    assert.deepStrictEqual(calls, ["a.cv.json"]);
  });

  it("collapses a burst of events for the same file into one call", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const calls = [];
    const trigger = createDebouncedWatcher((file) => calls.push(file));

    trigger("a.cv.json");
    t.mock.timers.tick(60);
    trigger("a.cv.json");
    t.mock.timers.tick(60);
    trigger("a.cv.json");
    t.mock.timers.tick(99);
    assert.deepStrictEqual(calls, []);
    t.mock.timers.tick(1);

    assert.deepStrictEqual(calls, ["a.cv.json"]);
  });

  it("debounces each file on its own", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const calls = [];
    const trigger = createDebouncedWatcher((file) => calls.push(file));

    trigger("a.cv.json");
    trigger("b.cv.json");
    t.mock.timers.tick(100);

    assert.deepStrictEqual(calls.sort(), ["a.cv.json", "b.cv.json"]);
  });

  it("fires again for a later change to the same file", (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const calls = [];
    const trigger = createDebouncedWatcher((file) => calls.push(file));

    trigger("a.cv.json");
    t.mock.timers.tick(100);
    trigger("a.cv.json");
    t.mock.timers.tick(100);

    assert.deepStrictEqual(calls, ["a.cv.json", "a.cv.json"]);
  });
});
