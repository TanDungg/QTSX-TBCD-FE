import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Card } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import { LayDuoiFile } from "src/util/Common";
// import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

function TaiLieuThamKhaoChiTiet({ match, history }) {
  const dispatch = useDispatch();
  const [Data, setData] = useState([]);
  const [FileTaiLieu, setFileTaiLieu] = useState([]);

  useEffect(() => {
    const { id } = match.params;
    getListData(id);

    return () => dispatch(fetchReset());
  }, []);

  const getListData = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_TaiLieuThamKhao/${id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        setData(res.data);
        const fileUrl =
          res.data.fileTaiLieu && BASE_URL_API + res.data.fileTaiLieu;

        const duoifile =
          res.data.fileTaiLieu && LayDuoiFile(res.data.fileTaiLieu);

        const file = [
          {
            uri: `${fileUrl}`,
            fileType: duoifile,
            fileName: res.data.tenTaiLieu,
          },
        ];
        setFileTaiLieu(file);
      }
    });
  };

  const goBack = () => {
    history.push(`${match.url.replace(`/${match.params.id}/chi-tiet`, "")}`);
  };

  const title = Data && Data.tenTaiLieu && Data.tenTaiLieu.toUpperCase();

  return (
    <div className="gx-main-content">
      <ContainerHeader title={title} back={goBack} />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <DocViewer
          pluginRenderers={DocViewerRenderers}
          documents={FileTaiLieu}
          style={{ width: "100%", height: "70vh" }}
        />
      </Card>
    </div>
  );
}

export default TaiLieuThamKhaoChiTiet;
