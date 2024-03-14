import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Modal as AntModal,
  Form,
  Divider,
  Input,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
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
import { DEFAULT_FORM_ADD_130PX } from "src/constants/Config";

const FormItem = Form.Item;

function DuyetDanhGia({ history, permission }) {
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
  const [SelectedDanhGia, setSelectedDanhGia] = useState([]);
  const [SelectedKeys, setSelectedKeys] = useState([]);
  const [ActiveModalTuChoi, setActiveModalTuChoi] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [fieldTouch, setFieldTouch] = useState(false);

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
          `vptq_lms_HocTrucTuyen/danh-gia-chua-duyet?${param}`,
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
              nguoiDanhGia: `${data.maNhanVien} - ${data.fullName}`,
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
          `vptq_lms_HocTrucTuyen/filter-danh-gia-chua-duyet?donVi_Id=${INFO.donVi_Id}`,
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
      width: 250,
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
      title: "Người đánh giá",
      dataIndex: "nguoiDanhGia",
      key: "nguoiDanhGia",
      align: "left",
      width: 200,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.nguoiDanhGia,
            value: d.nguoiDanhGia,
          };
        })
      ),
      onFilter: (value, record) => record.nguoiDanhGia.includes(value),
      filterSearch: true,
    },
    {
      title: "Nội dung đánh giá",
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
      title: "Điểm đánh giá",
      dataIndex: "diem",
      key: "diem",
      align: "center",
      width: 120,
      filters: removeDuplicates(
        map(Data, (d) => {
          return {
            text: d.diem,
            value: d.diem,
          };
        })
      ),
      onFilter: (value, record) => record.diem.includes(value),
      filterSearch: true,
    },
    {
      title: "Ngày đánh giá",
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
    const newData = SelectedDanhGia.map((danhgia) => {
      return danhgia.vptq_lms_DanhGia_Id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/duyet-danh-gia?${param}`,
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
          setSelectedDanhGia([]);
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
    title: "Xác nhận duyệt đánh giá",
    onOk: handleXacNhan,
  };

  const ModalXacNhan = () => {
    Modal(propxacnhan);
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
    selectedRows: SelectedDanhGia,
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedDanhGia = [...selectedRows];
      const newSelectedKeys = [...selectedRowKeys];
      setSelectedDanhGia(newSelectedDanhGia);
      setSelectedKeys(newSelectedKeys);
    },
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<CheckCircleOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="primary"
          onClick={() => ModalXacNhan()}
          disabled={SelectedDanhGia.length === 0}
        >
          Duyệt
        </Button>
        <Button
          icon={<CloseCircleOutlined />}
          className="th-margin-bottom-0 btn-margin-bottom-0"
          type="danger"
          onClick={() => setActiveModalTuChoi(true)}
          disabled={SelectedDanhGia.length === 0}
        >
          Từ chối
        </Button>
      </>
    );
  };

  const onFinish = (values) => {
    handleTuChoi(values.tuchoi);
  };

  const handleTuChoi = (tuchoi) => {
    const param = convertObjectToUrlParams({
      donVi_Id: INFO.donVi_Id,
      lyDoTuChoi: tuchoi.lyDoTuChoi,
    });
    
    const newData = SelectedDanhGia.map((hoidap) => {
      return hoidap.vptq_lms_DanhGia_Id;
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `vptq_lms_HocTrucTuyen/duyet-danh-gia?${param}`,
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
          setSelectedDanhGia([]);
          setSelectedKeys([]);
          setChuyenDe(null);
          getListChuyenDe();
          getListData();
          handleCancel();
        }
      })
      .catch((error) => console.error(error));
  };

  const handleCancel = () => {
    setActiveModalTuChoi(false);
    resetFields();
    setFieldTouch(false);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Duyệt đánh giá"
        description="Duyệt đánh giá"
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
          scroll={{ x: 1300, y: "53vh" }}
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
      <AntModal
        title={"Từ chối đánh giá"}
        className="th-card-reset-margin"
        open={ActiveModalTuChoi}
        width={width >= 1600 ? `60%` : width >= 1200 ? `75%` : "100%"}
        closable={true}
        onCancel={() => handleCancel()}
        footer={null}
      >
        <Card
          className="th-card-margin-bottom th-card-reset-margin"
          align={"center"}
          style={{ width: "100%" }}
        >
          <Form
            {...DEFAULT_FORM_ADD_130PX}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <Col x lg={16} xs={24}>
              <FormItem
                label="Lý do từ chối"
                name={["tuchoi", "lyDoTuChoi"]}
                rules={[
                  {
                    type: "string",
                    required: true,
                  },
                ]}
              >
                <Input className="input-item" placeholder="Lý do từ chối" />
              </FormItem>
            </Col>
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
                  icon={<RollbackOutlined />}
                  className="th-margin-bottom-0 btn-margin-bottom-0"
                  onClick={() => handleCancel()}
                >
                  Quay lại
                </Button>
                <Button
                  icon={<CloseCircleOutlined />}
                  className="th-margin-bottom-0 btn-margin-bottom-0"
                  type="danger"
                  htmlType={"submit"}
                  disabled={!fieldTouch}
                >
                  Từ chối
                </Button>
              </div>
            </div>
          </Form>
        </Card>
      </AntModal>
    </div>
  );
}

export default DuyetDanhGia;
