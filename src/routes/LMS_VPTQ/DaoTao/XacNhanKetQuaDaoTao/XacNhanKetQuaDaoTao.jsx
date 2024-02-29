import {
  Card,
  Col,
  Modal as AntModal,
  Row,
  Button,
  Form,
  Input,
  Divider,
  Image,
} from "antd";
import map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeDuplicates,
  reDataForTable,
  getTokenInfo,
  getLocalStorage,
} from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { EditableTableRow, Table } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API, DEFAULT_FORM_ADD_100PX } from "src/constants/Config";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { EditableRow, EditableCell } = EditableTableRow;
const { confirm } = AntModal;
const FormItem = Form.Item;

function XacNhanKetQuaDaoTao({ permission, history }) {
  const dispatch = useDispatch();
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [Data, setData] = useState([]);
  const [DataChiTiet, setDataChiTiet] = useState(null);
  const [ActiveModalHuyDuyet, setActiveModalHuyDuyet] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [fieldTouch, setFieldTouch] = useState(false);

  useEffect(() => {
    if (permission && permission.view) {
      getListData();
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/list-chua-duyet?donViHienHanh_Id=${INFO.donVi_Id}`,
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
      } else {
        setData([]);
      }
    });
  };

  const actionContent = (item) => {
    const duyet = {
      onClick: () => {
        setDataChiTiet(item);
        ModalDuyetChungNhan(item.vptq_lms_KetQuaDaoTao_Id);
      },
    };

    const huy = {
      onClick: () => {
        setActiveModalHuyDuyet(true);
        setDataChiTiet(item);
      },
    };

    return (
      <div>
        <React.Fragment>
          <a
            {...duyet}
            title="Duyệt chứng nhận đào tạo"
            style={{ fontSize: "15px" }}
          >
            <CheckCircleOutlined />
          </a>
          <Divider type="vertical" />
          <a
            {...huy}
            title="Hủy duyệt chứng nhận đào tạo"
            style={{ color: "red", fontSize: "15px" }}
          >
            <CloseCircleOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  let dataList = reDataForTable(Data);

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
      fixed: "left",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "maNhanVien",
      key: "maNhanVien",
      align: "center",
      width: 110,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.maNhanVien,
            value: d.maNhanVien,
          };
        })
      ),
      onFilter: (value, record) => record.maNhanVien.includes(value),
      filterSearch: true,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 140,
      fixed: width >= 1600 && "left",
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.fullName,
            value: d.fullName,
          };
        })
      ),
      onFilter: (value, record) => record.fullName.includes(value),
      filterSearch: true,
    },
    {
      title: "Chuyên đề đào tạo",
      dataIndex: "tenChuyenDeDaoTao",
      key: "tenChuyenDeDaoTao",
      align: "left",
      width: 230,
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: "Lớp học",
      dataIndex: "tenLopHoc",
      key: "tenLopHoc",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.tenLopHoc,
            value: d.tenLopHoc,
          };
        })
      ),
      onFilter: (value, record) => record.tenLopHoc.includes(value),
      filterSearch: true,
    },
    {
      title: "Hình thức đào tạo",
      dataIndex: "tenHinhThucDaoTao",
      key: "tenHinhThucDaoTao",
      align: "left",
      width: 150,
      filters: removeDuplicates(
        map(dataList, (d) => {
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
      title: (
        <div>
          Thời gian
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiGianDaoTao",
      key: "thoiGianDaoTao",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianDaoTao,
            value: d.thoiGianDaoTao,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianDaoTao.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời gian
          <br />
          kết thúc
        </div>
      ),
      dataIndex: "thoiGianKetThuc",
      key: "thoiGianKetThuc",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiGianKetThuc,
            value: d.thoiGianKetThuc,
          };
        })
      ),
      onFilter: (value, record) => record.thoiGianKetThuc.includes(value),
      filterSearch: true,
    },
    {
      title: (
        <div>
          Thời lượng
          <br />
          đào tạo
        </div>
      ),
      dataIndex: "thoiLuongDaoTao",
      key: "thoiLuongDaoTao",
      align: "center",
      width: 100,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.thoiLuongDaoTao,
            value: d.thoiLuongDaoTao,
          };
        })
      ),
      onFilter: (value, record) =>
        record.thoiLuongDaoTao.toString().includes(value),
      filterSearch: true,
      render: (value) => {
        return value && <span>{value} phút</span>;
      },
    },
    {
      title: "Giấy chứng nhận",
      dataIndex: "giayChungNhan",
      key: "giayChungNhan",
      align: "center",
      width: 130,
      render: (value) =>
        value && (
          <Image
            src={BASE_URL_API + value}
            alt="Hình ảnh"
            style={{ height: "80px" }}
          />
        ),
    },
    {
      title: "Ghi chú",
      dataIndex: "moTa",
      key: "moTa",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(dataList, (d) => {
          return {
            text: d.moTa,
            value: d.moTa,
          };
        })
      ),
      onFilter: (value, record) => record.moTa.includes(value),
      filterSearch: true,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = map(colValues, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const handleDuyetChungNhan = (id) => {
    const newData = {
      vptq_lms_KetQuaDaoTao_Id: id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/duyet/${id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          handleRefesh();
          getListData();
        }
      })
      .catch((error) => console.error(error));
  };

  const ModalDuyetChungNhan = (id) => {
    confirm({
      content: "Xác nhận duyệt giấy chứng nhận kết quả đào tạo!",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        handleDuyetChungNhan(id);
      },
    });
  };

  const onFinish = (values) => {
    saveData(values.formhuyduyet);
  };

  const saveData = (formhuyduyet) => {
    const newData = {
      ...formhuyduyet,
      vptq_lms_KetQuaDaoTao_Id:
        DataChiTiet && DataChiTiet.vptq_lms_KetQuaDaoTao_Id,
    };
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/duyet/${DataChiTiet.vptq_lms_KetQuaDaoTao_Id}?donViHienHanh_Id=${INFO.donVi_Id}`,
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
          handleRefesh();
          getListData();
        } else {
          setFieldTouch(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const handleRefesh = () => {
    setActiveModalHuyDuyet(false);
    setDataChiTiet(null);
    resetFields();
    setFieldTouch(false);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Duyệt giấy chứng nhận kết quả đào tạo"}
        description="Danh sách giấy chứng nhận kết quả đào tạo"
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Table
          bordered
          columns={columns}
          scroll={{ x: 1500, y: "48vh" }}
          components={components}
          className="gx-table-responsive th-table"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
          loading={loading}
        />
      </Card>
      <AntModal
        title={"Hủy duyệt giấy chứng nhận kết quả đào tạo"}
        className="th-card-reset-margin"
        open={ActiveModalHuyDuyet}
        width={width >= 1600 ? `50%` : width >= 1200 ? `70%` : "100%"}
        closable={true}
        onCancel={() => handleRefesh()}
        footer={null}
      >
        <Form
          {...DEFAULT_FORM_ADD_100PX}
          form={form}
          name="nguoi-dung-control"
          onFinish={onFinish}
          onFieldsChange={() => setFieldTouch(true)}
        >
          <Card className="th-card-margin-bottom th-card-reset-margin">
            <Row align={"center"} style={{ width: "100%" }}>
              <Col
                lg={16}
                xs={24}
                style={{
                  marginBottom: "5px",
                  padding: "0px 30px",
                }}
              >
                <FormItem
                  label="Lý do hủy"
                  name={["formhuyduyet", "lyDoTuChoi"]}
                  rules={[
                    {
                      required: true,
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập lý do hủy duyệt giấy chứng nhận kết quả đào tạo"
                  />
                </FormItem>
              </Col>
            </Row>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Divider />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  icon={<CloseCircleOutlined />}
                  className="th-margin-bottom-0"
                  onClick={() => handleRefesh()}
                >
                  Đóng
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  className="th-margin-bottom-0"
                  type="danger"
                  htmlType={"submit"}
                  disabled={!fieldTouch}
                >
                  Hủy duyệt
                </Button>
              </div>
            </div>
          </Card>
        </Form>
      </AntModal>
    </div>
  );
}

export default XacNhanKetQuaDaoTao;
