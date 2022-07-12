import { BAR } from "."
import { FOO } from "@yawn/foo"
test("BAR", () => {
    expect(BAR).toEqual(FOO * 2)
    expect(BAR).toEqual(6)
})
