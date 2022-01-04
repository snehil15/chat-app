import React, { useEffect, useState } from "react";

const Image = ({ message, blob }) => {
  const [imageSrc, setImageSrc] = useState("");

  const readFile = () => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject("none");
    });
  };

  useEffect(async () => {
    await readFile().then((res) => {
      setImageSrc(res);
      // console.log(res);
    });
    // setImageSrc(res);
  }, [blob]);

  return (
    <div className="msg-image">
      <img src={imageSrc} />
      {message ? <p>{message}</p> : ""}
    </div>
  );
};

export default Image;
