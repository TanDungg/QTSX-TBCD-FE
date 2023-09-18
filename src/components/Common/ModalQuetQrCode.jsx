import { Modal as AntModal } from "antd";
import React, { useState } from "react";
import Html5QrcodePlugin from "./Html5QrcodePlugin.jsx";
function ModalNhapKhoThietBi({ openModal, openModalFS, search }) {
  const [maQrCode, setMaQrCode] = useState();
  const onNewScanResult = (decodedText, decodedResult) => {
    if (
      maQrCode &&
      maQrCode.toString() !== decodedResult.decodedText.toString()
    ) {
      setMaQrCode(decodedResult.decodedText);
      search(decodedResult.decodedText);
      openModalFS(false);
    } else {
      search(decodedResult.decodedText);
      openModalFS(false);
    }
  };

  const handleCancel = () => {
    openModalFS(false);
  };
  return (
    <AntModal
      title="Quét mã QR_CODE"
      open={openModal}
      width={`90%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Html5QrcodePlugin
        fps={10}
        qrbox={250}
        disableFlip={false}
        qrCodeSuccessCallback={onNewScanResult}
      />
    </AntModal>
  );
}

export default ModalNhapKhoThietBi;
