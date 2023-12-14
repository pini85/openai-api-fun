import ffmpeg from "fluent-ffmpeg";

const convertToWav = (filePath) => {
  return new Promise((resolve, reject) => {
    const output = `${filePath}.wav`;
    ffmpeg(filePath)
      .outputFormat("wav")
      .on("end", () => resolve(output))
      .on("error", (err) => reject(err))
      .save(output);
  });
};

export default convertToWav;
