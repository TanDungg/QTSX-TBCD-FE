import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Modal as AntModal,
  Form,
  Input,
  Row,
  Button,
  Col,
  Card,
  DatePicker,
  Upload,
  Image,
} from "antd";
import { isEmpty, map } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import { BASE_URL_API, DEFAULT_FORM_THEMVATTU } from "src/constants/Config";
import Helpers from "src/helpers";
import {
  convertObjectToUrlParams,
  reDataForTable,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalChonVatTu({ openModalFS, openModal, DataThemVatTu, itemData }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [DataListVatTu, setDataListVatTu] = useState([]);
  const [VatTuTrongKho, setVatTuTrongKho] = useState({});
  const [ListVatTu, setListVatTu] = useState([]);
  const [FileHinhAnh, setFileHinhAnh] = useState(null);
  const [FileAnh, setFileAnh] = useState(null);
  const [DisableUpload, setDisableUpload] = useState(false);
  const [OpenImage, setOpenImage] = useState(false);

  useEffect(() => {
    if (openModal) {
      getListVatTu();
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListVatTu = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_VatTu?page=-1`,
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
        const newListVatTu = res.data.map((data) => {
          return {
            ...data,
            vatTu: `${data.maVatTu} - ${data.tenVatTu}`,
          };
        });

        const newData = newListVatTu.filter((data) => {
          if (itemData.length > 0) {
            return !itemData.some(
              (item) => item.tits_qtsx_VatTu_Id.toLowerCase() === data.id
            );
          } else {
            return true;
          }
        });
        setListVatTu(newData);
      } else {
        setListVatTu([]);
      }
    });
  };

  const getSoLuongTonKho = (tits_qtsx_VatTu_Id) => {
    let params = convertObjectToUrlParams({
      tits_qtsx_VatTu_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ViTriLuuKhoVatTu/get-so-luong-ton-kho-vat-tu?${params}`,
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
        setVatTuTrongKho(res.data);
        setFieldsValue({
          themvattu: {
            soLuongTonKho: res.data.soLuongTonKho,
          },
        });
      }
    });
  };

  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    const title = "vật tư";
    ModalDeleteConfirm(deleteItemAction, item, item.tenVatTu, title);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const newData = DataListVatTu.filter(
      (d) => d.tits_qtsx_VatTu_Id !== item.tits_qtsx_VatTu_Id
    );
    setDataListVatTu(newData);

    const vattu = DataListVatTu.filter(
      (d) => d.tits_qtsx_VatTu_Id === item.tits_qtsx_VatTu_Id
    );
    setListVatTu([...ListVatTu, vattu[0]]);
  };

  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal = { onClick: () => deleteItemFunc(item) };

    return (
      <div>
        <React.Fragment>
          <a {...deleteItemVal} title="Xóa">
            <DeleteOutlined />
          </a>
        </React.Fragment>
      </div>
    );
  };

  const renderHinhAnh = (item) => {
    if (!isEmpty(item.hinhAnh)) {
      return (
        <span>
          <a
            target="_blank"
            href={BASE_URL_API + item.hinhAnh}
            rel="noopener noreferrer"
          >
            {item.hinhAnh.split("/")[5]}
          </a>
        </span>
      );
    }
    return null;
  };

  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 45,
      align: "center",
    },
    {
      title: "Mã vật tư",
      dataIndex: "maVatTu",
      key: "maVatTu",
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "tenVatTu",
      key: "tenVatTu",
      align: "center",
    },
    {
      title: "Đơn vị tính",
      dataIndex: "tenDonViTinh",
      key: "tenDonViTinh",
      align: "center",
    },
    {
      title: "SL cần",
      dataIndex: "soLuongCan",
      key: "soLuongCan",
      align: "center",
    },
    {
      title: "SL tồn kho",
      dataIndex: "soLuongTonKho",
      key: "soLuongTonKho",
      align: "center",
    },
    {
      title: "SL yêu cầu thêm",
      dataIndex: "soLuongYeuCau",
      key: "soLuongYeuCau",
      align: "center",
    },
    {
      title: "Hạng mục sử dụng",
      dataIndex: "hangMucSuDung",
      key: "hangMucSuDung",
      align: "center",
    },
    {
      title: "Hình ảnh",
      key: "hinhAnh",
      align: "center",
      render: (record) => renderHinhAnh(record),
    },
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 80,
      render: (value) => actionContent(value),
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

  const onFinish = (values) => {
    const themvattu = values.themvattu;
    if (themvattu.hinhAnh) {
      const formData = new FormData();
      formData.append("file", themvattu.hinhAnh.file);
      fetch(`${BASE_URL_API}/api/Upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer ".concat(INFO.token),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          themvattu.hinhAnh = data.path;
          const DataList = {
            ...themvattu,
            ...VatTuTrongKho,
            soLuongYeuCau:
              parseFloat(themvattu.soLuongCan) +
              parseFloat(themvattu.soLuongTonKho),
          };
          setDataListVatTu([...DataListVatTu, DataList]);

          const vattu = ListVatTu.filter(
            (d) => d.id !== data.tits_qtsx_VatTu_Id
          );
          setListVatTu(vattu);
          setVatTuTrongKho({});
          resetFields();
          setFieldTouch(false);
          setDisableUpload(false);
          setFileHinhAnh(null);
        })
        .catch(() => {
          console.log("upload failed.");
        });
    } else {
      setFieldTouch(false);
      Helpers.alertError(`Vui lòng tải hình ảnh lên`);
    }
  };

  const XacNhan = () => {
    DataThemVatTu(DataListVatTu);
    openModalFS(false);
    setListVatTu([]);
    setDataListVatTu([]);
  };

  const SelectSoLuongTonKho = (value) => {
    getSoLuongTonKho(value);
  };

  const props = {
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        Helpers.alertError(`${file.name} không phải hình ảnh`);
      } else {
        setFileHinhAnh(file);
        setDisableUpload(true);
        setFieldTouch(true);
        const reader = new FileReader();
        reader.onload = (e) => setFileAnh(e.target.result);
        reader.readAsDataURL(file);
        return false;
      }
    },
    showUploadList: false,
    maxCount: 1,
  };

  const handleViewFile = () => {
    setOpenImage(true);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm thông tin vật tư"
      open={openModal}
      width={width > 1200 ? `85%` : `90%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <div className="gx-main-content">
          <Form
            {...DEFAULT_FORM_THEMVATTU}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <Row>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Tên vật tư"
                  name={["themvattu", "tits_qtsx_VatTu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListVatTu}
                    placeholder="Chọn tên vật tư"
                    optionsvalue={["id", "vatTu"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    onSelect={SelectSoLuongTonKho}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Đơn vị tính"
                  name={["themvattu", "tits_qtsx_VatTu_Id"]}
                  rules={[
                    {
                      type: "string",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    className="heading-select slt-search th-select-heading"
                    data={ListVatTu}
                    placeholder="Đơn vị tính của vật tư"
                    optionsvalue={["id", "tenDonViTinh"]}
                    style={{ width: "100%" }}
                    showSearch
                    optionFilterProp="name"
                    disabled={true}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="SL tồn kho"
                  name={["themvattu", "soLuongTonKho"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    step="0.01"
                    className="input-item"
                    placeholder="Số lượng tồn kho"
                    disabled={true}
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="SL cần"
                  name={["themvattu", "soLuongCan"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    className="input-item"
                    placeholder="Số lượng cần"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Hạng mục sử dụng"
                  name={["themvattu", "hangMucSuDung"]}
                  rules={[
                    {
                      type: "string",
                    },
                  ]}
                >
                  <Input
                    className="input-item"
                    placeholder="Nhập hạn mục sử dụng"
                  />
                </FormItem>
              </Col>
              <Col
                xxl={12}
                xl={12}
                lg={24}
                md={24}
                sm={24}
                xs={24}
                style={{ marginBottom: 8 }}
              >
                <FormItem
                  label="Hình ảnh"
                  name={["themvattu", "hinhAnh"]}
                  rules={[
                    {
                      type: "file",
                      required: true,
                    },
                  ]}
                >
                  {!DisableUpload ? (
                    <Upload {...props}>
                      <Button
                        style={{
                          marginBottom: 0,
                        }}
                        icon={<UploadOutlined />}
                      >
                        Tải file hình ảnh
                      </Button>
                    </Upload>
                  ) : (
                    <span>
                      <span
                        style={{ color: "#0469B9", cursor: "pointer" }}
                        onClick={() => handleViewFile(FileHinhAnh)}
                      >
                        {FileHinhAnh.name.length > 20
                          ? FileHinhAnh.name.substring(0, 20) + "..."
                          : FileHinhAnh.name}
                      </span>
                      <DeleteOutlined
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setFileHinhAnh(null);
                          setDisableUpload(false);
                          setFieldsValue({
                            sanpham: {
                              hinhAnh: null,
                            },
                          });
                        }}
                      />
                      <Image
                        width={100}
                        src={FileAnh}
                        alt="preview"
                        style={{
                          display: "none",
                        }}
                        preview={{
                          visible: OpenImage,
                          scaleStep: 0.5,
                          src: FileAnh,
                          onVisibleChange: (value) => {
                            setOpenImage(value);
                          },
                        }}
                      />
                    </span>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row justify={"center"}>
              <Button type="primary" htmlType={"submit"} disabled={!fieldTouch}>
                Thêm vật tư
              </Button>
            </Row>
          </Form>
        </div>

        <Table
          bordered
          columns={columns}
          scroll={{ x: 1300, y: "55vh" }}
          components={components}
          className="gx-table-responsive"
          dataSource={reDataForTable(DataListVatTu)}
          size="small"
          rowClassName={"editable-row"}
          pagination={false}
        />

        <Row justify={"center"} style={{ marginTop: 15 }}>
          <Button
            type="primary"
            onClick={XacNhan}
            disabled={DataListVatTu.length === 0}
          >
            Xác nhận
          </Button>
        </Row>
      </Card>
    </AntModal>
  );
}

export default ModalChonVatTu;
