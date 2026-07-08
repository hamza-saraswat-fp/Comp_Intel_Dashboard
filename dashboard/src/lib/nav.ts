export type View =
  | { t: "overview" }
  | { t: "whatsnew" }
  | { t: "competitor"; slug: string }
  | { t: "chat" }
