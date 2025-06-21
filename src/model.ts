import * as Yup from "yup";

const PlaySchema = Yup.object().shape({
  _id: Yup.string().defined().default(""),
  title: Yup.string().required().default(""),
  note: Yup.string().defined().default(""),
});
const BandSchema = Yup.object().shape({
  name: Yup.string().required().default(""),
});
export const SetListSchema = Yup.object().shape({
  meta: Yup.object().shape({
    createDate: Yup.string().required().default(""),
    version: Yup.string().required().default(""),
  }),
  band: BandSchema,
  event: Yup.object().shape({
    name: Yup.string().required().default(""),
    date: Yup.string().default(""),
    openTime: Yup.string().default(""),
    startTime: Yup.string().default(""),
  }),
  playings: Yup.array().of(PlaySchema).min(1).required().default([]),
  theme: Yup.string()
    .required()
    .oneOf(["mqtn", "basic", "minimal", "mqtn2"])
    .default("mqtn"),
});
export type SetListIdentifier = string;
export type SetlistOptionProps = {
  readonly displayName: string;
};
export type SetListValue = Yup.InferType<typeof SetListSchema>;
export type SetList = SetListValue & SetlistOptionProps;
