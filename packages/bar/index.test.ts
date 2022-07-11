import { BAR } from "."
import { FOO } from "@yawn/foo"
test("BAR", () => {
    expect(BAR).toBe(FOO * 2)
})
