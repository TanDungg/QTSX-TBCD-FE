import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Image } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import map from "lodash/map";
import { Table, Select, Modal } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  reDataForTable,
  removeDuplicates,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";

function XacNhanPhanHoi({ history, permission }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);
  const [ListChuyenDe, setListChuyenDe] = useState([]);
  const [ChuyenDe, setChuyenDe] = useState(null);
  const [SelectedPhanHoi, setSelectedPhanHoi] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    if (permission && permission.view) {
      getListChuyenDe();
      getListData(ChuyenDe);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (vptq_lms_ChuyenDeDaoTao_Id) => {
    let param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      vptq_lms_ChuyenDeDaoTao_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/phan-hoi-chua-duyet?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          const newData = res.data.map((data) => {
            return {
              ...data,
              nguoiHoi: `${data.maNhanVien} - ${data.fullName}`,
            };
          });
          setData(newData);
        } else {
          setData([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const getListChuyenDe = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/filter-phan-hoi-chua-duyet?donVi_Id=${INFO.donVi_Id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListChuyenDe(res.data);
        } else {
          setListChuyenDe([]);
        }
      })
      .catch((error) => console.error(error));
  };

  let renderHead = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      fixed: width > 1600 && "left",
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenChuyenDeDaoTao,
            value: d.tenChuyenDeDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenChuyenDeDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "center",
      width: 150,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tenHinhThucDaoTao,
            value: d.tenHinhThucDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.tenHinhThucDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: "Người hỏi",
      dataIndex: "nguoiHoi",
      key: "nguoiHoi",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.nguoiHoi,
            value: d.nguoiHoi,
          };
        })
      ),
      onFilter: (value, record) => record.nguoiHoi.includes(value),
      filterSearch: true,
    },
    {
      title: "Nội dung phản hồi",
      dataIndex: "noiDung",
      key: "noiDung",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.noiDung,
            value: d.noiDung,
          };
        })
      ),
      onFilter: (value, record) => record.noiDung.includes(value),
      filterSearch: true,
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "noiDungHoiDap",
      key: "noiDungHoiDap",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.noiDungHoiDap,
            value: d.noiDungHoiDap,
          };
        })
      ),
      onFilter: (value, record) => record.noiDung.includes(value),
      filterSearch: true,
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.hinhAnh,
            value: d.hinhAnh,
          };
        })
      ),
      onFilter: (value, record) => record.hinhAnh.includes(value),
      filterSearch: true,
      render: (value) =>
        value && (
          <span>
            <Image
              src={BASE_URL_API + value}
              alt="Hình ảnh"
              style={{ width: "80px" }}
            />
          </span>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngayTao",
      key: "ngayTao",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.ngayTao,
            value: d.ngayTao,
          };
        })
      ),
      onFilter: (value, record) => record.ngayTao.includes(value),
      filterSearch: true,
    },
  ];

  const handleXacNhan = () => {
    const param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      isDuyet: true,
    });
    const newData = SelectedPhanHoi.map((phanhoi) => {
      return phanhoi.vptq_lms_PhanHoi_Id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/duyet-phan-hoi?${param}`,
          "PUT",
          newData,
          "DUYET",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setSelectedPhanHoi([]);
          setSelectedKeys([]);
          setChuyenDe(null);
          getListChuyenDe();
          getListData();
        }
      })
      .catch((error) => console.error(error));
  };

  const propxacnhan = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt phản hồi",
    onOk: handleXacNhan,
  };

  const ModalXacNhan = () => {
    Modal(propxacnhan);
  };

  const handleTuChoi = () => {
    const param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      isDuyet: false,
    });
    const newData = SelectedPhanHoi.map((hoidap) => {
      return hoidap.vptq_lms_PhanHoi_Id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/duyet-phan-hoi?${param}`,
          "PUT",
          newData,
          "TUCHOI",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setSelectedPhanHoi([]);
          setSelectedKeys([]);
          setChuyenDe(null);
          getListChuyenDe();
          getListData();
        }
      })
      .catch((error) => console.error(error));
  };

  const proptuchoi = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Từ chối duyệt phản hồi",
    onOk: handleTuChoi,
  };

  const ModalTuChoi = () => {
    Modal(proptuchoi);
  };

  const handleOnSelectChuyenDe = (value) => {
    setChuyenDe(value);
    getListData(value);
  };

  const handleClearChuyenDe = () => {
    setChuyenDe(null);
    getListData(null);
  };

  const rowSelection = {
    selectedRowKeys: SelectedKeys,
    selectedRows: SelectedPhanHoi,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedPhanHoi = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedPhanHoi(newSelectedPhanHoi);
      setSelectedKeys(newSelectedKeys);
    },
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<CheckCircleOutlined />}
          className="th-margin-bottom-0"
          type="primary"
          onClick={() => ModalXacNhan()}
          disabled={SelectedPhanHoi.length === 0}
        >
          Duyệt
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          className="th-margin-bottom-0"
          type="danger"
          onClick={() => ModalTuChoi()}
          disabled={SelectedPhanHoi.length === 0}
        >
          Từ chối
        </Button>
      </>
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Duyệt phản hồi"
        description="Duyệt phản hồi"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom">
        <Row>
          <Col
            xxl={8}
            xl={8}
            lg={12}
            md={12}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <span>Chuyên đề:</span>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListChuyenDe ? ListChuyenDe : []}
              placeholder="Chọn chuyên đề đào tạo"
              optionsvalue={["vptq_lms_ChuyenDeDaoTao_Id", "tenChuyenDeDaoTao"]}
              style={{ width: "100%" }}
              value={ChuyenDe}
              showSearch
              optionFilterProp={"name"}
              onSelect={handleOnSelectChuyenDe}
              allowClear
              onClear={handleClearChuyenDe}
            />
          </Col>
        </Row>
      </Card>
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          scroll={{ x: 1500, y: "53vh" }}
          columns={renderHead}
          className="gx-table-responsive th-table"
          dataSource={reDataForTable(Data)}
          size="small"
          pagination={false}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
            preserveSelectedRowKeys: true,
            selectedRowKeys: SelectedKeys,
          }}
        />
      </Card>
    </div>
  );
}

export default XacNhanPhanHoi;
