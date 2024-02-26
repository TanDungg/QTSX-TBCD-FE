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

function XacNhanHoiDap({ history, permission }) {
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
  const [SelectedHoiDap, setSelectedHoiDap] = useState([]);
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
          `vptq_lms_HocTrucTuyen/hoi-dap-chua-duyet?${param}`,
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
          `vptq_lms_HocTrucTuyen/filter-hoi-dap-chua-duyet?donVi_Id=${INFO.donVi_Id}`,
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
        if (res && res.status === 200 && res.data) {
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
      title: "Tiêu đề",
      dataIndex: "tieuDe",
      key: "tieuDe",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.tieuDe,
            value: d.tieuDe,
          };
        })
      ),
      onFilter: (value, record) => record.tieuDe.includes(value),
      filterSearch: true,
    },
    {
      title: "Nội dung câu hỏi",
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
      title: "Hình ảnh",
      dataIndex: "hinhAnh",
      key: "hinhAnh",
      align: "left",
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
              style={{ height: "80px" }}
            />
          </span>
        ),
    },
    {
      title: "File đính kèm",
      dataIndex: "fileDinhKem",
      key: "fileDinhKem",
      align: "left",
      width: 180,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.fileDinhKem,
            value: d.fileDinhKem,
          };
        })
      ),
      onFilter: (value, record) => record.fileDinhKem.includes(value),
      filterSearch: true,
      render: (value) => {
        return (
          value && (
            <span>
              <a
                target="_blank"
                href={BASE_URL_API + value}
                rel="noopener noreferrer"
              >
                {value.split("/")[5]}
              </a>
            </span>
          )
        );
      },
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
    const newData = SelectedHoiDap.map((lophoc) => {
      return lophoc.id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/duyet`,
          "PUT",
          newData,
          "XACNHAN",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res.status !== 409) {
          setSelectedHoiDap([]);
          setSelectedKeys([]);
          getListData(ChuyenDe);
        }
      })
      .catch((error) => console.error(error));
  };

  const prop = {
    type: "confirm",
    okText: "Xác nhận",
    cancelText: "Hủy",
    title: "Xác nhận duyệt lớp học",
    onOk: handleXacNhan,
  };

  const ModalXacNhan = () => {
    Modal(prop);
  };

  const handleTuChoi = (data) => {
    const newData = SelectedHoiDap.map((lophoc) => {
      return lophoc.id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_LopHoc/duyet/?lyDoTuChoi=${data}`,
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
        if (res && res.status !== 409) {
          setSelectedHoiDap([]);
          setSelectedKeys([]);
          getListData(ChuyenDe);
        }
      })
      .catch((error) => console.error(error));
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
    selectedRows: SelectedHoiDap,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedHoiDap = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedHoiDap(newSelectedHoiDap);
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
          onClick={ModalXacNhan}
          disabled={SelectedHoiDap.length === 0}
        >
          Duyệt
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          className="th-margin-bottom-0"
          type="danger"
          onClick={() => ""}
          disabled={SelectedHoiDap.length === 0}
        >
          Từ chối
        </Button>
      </>
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Danh sách lớp học chưa duyệt"
        description="Danh sách lớp học chưa duyệt"
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
              optionsvalue={["id", "tenChuyenDeDaoTao"]}
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

export default XacNhanHoiDap;
