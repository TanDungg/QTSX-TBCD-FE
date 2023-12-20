import {
  Modal as AntModal,
  Form,
  Row,
  Button,
  Card,
  Checkbox,
  Input,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import {
  EditableTableRow,
  ModalDeleteConfirm,
  Select,
  Table,
} from "src/components/Common";
import { DEFAULT_FORM_CONGDOAN } from "src/constants/Config";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ModalThongTinKiemSoat from "./ModalChiTietTram";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { map } from "lodash";

const FormItem = Form.Item;
const { EditableRow, EditableCell } = EditableTableRow;

function ModalTram({ openModalFS, openModal, DataThemTram, itemData }) {
  const dispatch = useDispatch();
  const { width } = useSelector(({ common }) => common).toJS();
  const INFO = {
    ...getLocalStorage("menu"),
    user_Id: getTokenInfo().id,
    token: getTokenInfo().token,
  };
  const [fieldTouch, setFieldTouch] = useState(false);
  const [form] = Form.useForm();
  const { resetFields } = form;
  const [ListTram, setListTram] = useState([]);
  const [ListThietBi, setListThietBi] = useState([]);
  const [ListVatTu, setListVatTu] = useState([]);
  const [ListThongTinKiemSoat, setListThongTinKiemSoat] = useState([]);
  const [ActiveModalThongTin, setActiveModalThongTin] = useState(false);

  useEffect(() => {
    if (openModal) {
      getListTram();
      getListThietBi();
      getListVatTu();
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getListTram = () => {
    const param = convertObjectToUrlParams({
      tits_qtsx_Xuong_Id: itemData.tram.tits_qtsx_Xuong_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Tram/tram-by-xuong?${param}`,
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
        setListTram(res.data);
      } else {
        setListTram([]);
      }
    });
  };

  const getListThietBi = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_ThietBi?page=-1`,
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
        setListThietBi(res.data);
      } else {
        setListThietBi([]);
      }
    });
  };

  const getListVatTu = () => {
    const param = convertObjectToUrlParams({
      tits_qtsx_OEM_Id: itemData.oem.id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_QuyTrinhSanXuat/list-vat-tu-theo-OEM?${param}`,
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
        setListVatTu(res.data);
      } else {
        setListVatTu([]);
      }
    });
  };

  const deleteItemFunc = (item, title) => {
    ModalDeleteConfirm(deleteItemAction, item, item.tenThongTinKiemSoat, title);
  };

  const deleteItemAction = (item) => {
    const newData = ListThongTinKiemSoat.filter(
      (d) =>
        d.tits_qtsx_ThongTinKiemSoat_Id !== item.tits_qtsx_ThongTinKiemSoat_Id
    );
    setListThongTinKiemSoat(newData);
  };

  const actionContent = (item) => {
    const deleteVal = {
      onClick: () => deleteItemFunc(item, "thông tin kiểm soát"),
    };

    return (
      <div>
        <a {...deleteVal} title="Xóa thông tin kiểm soát">
          <DeleteOutlined />
        </a>
      </div>
    );
  };

  const handleCheckboxChange = (record, value) => {
    const newData = ListThongTinKiemSoat.map((thongtin) => {
      if (
        thongtin.tits_qtsx_ThongTinKiemSoat_Id ===
        record.tits_qtsx_ThongTinKiemSoat_Id
      ) {
        return value === "isXem"
          ? {
              ...thongtin,
              isXem: !thongtin.isXem,
            }
          : value === "isNhap"
          ? {
              ...thongtin,
              isNhap: !thongtin.isNhap,
            }
          : {
              ...thongtin,
              isKiemTraSoLo: !thongtin.isKiemTraSoLo,
            };
      }
      return thongtin;
    });

    setListThongTinKiemSoat(newData);
  };

  const renderSCL = (record, value) => {
    return (
      <Checkbox
        checked={
          value === "isXem"
            ? record.isXem
            : value === "isNhap"
            ? record.isNhap
            : record.isKiemTraSoLo
        }
        onChange={() => handleCheckboxChange(record, value)}
      />
    );
  };

  let colValues = [
    {
      title: "Chức năng",
      key: "action",
      align: "center",
      width: 120,
      render: (value) => actionContent(value),
    },
    {
      title: "Thông tin kiểm soát",
      dataIndex: "tenThongTinKiemSoat",
      key: "tenThongTinKiemSoat",
      align: "center",
    },
    {
      title: "Xem",
      key: "isXem",
      align: "center",
      render: (record) => renderSCL(record, "isXem"),
    },
    {
      title: "Nhập",
      key: "isNhap",
      align: "center",
      render: (record) => renderSCL(record, "isNhap"),
    },
    {
      title: "Kiểm tra số lô",
      key: "isKiemTraSoLo",
      align: "center",
      render: (record) => renderSCL(record, "isKiemTraSoLo"),
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
    const data = values.themtram;
    const listvattu =
      data.list_VatTus &&
      data.list_VatTus.map((dt) => {
        const vattu = ListVatTu.filter((d) => d.tits_qtsx_VatTu_Id === dt);
        if (vattu.length) {
          return {
            tits_qtsx_VatTu_Id: vattu && vattu[0].tits_qtsx_VatTu_Id,
            maVatTu: vattu && vattu[0].maVatTu,
            tenVatTu: vattu && vattu[0].tenVatTu,
          };
        }
        return dt;
      });

    const tram = ListTram.filter((d) => d.id === data.tits_qtsx_Tram_Id);
    const thietbi =
      data.tits_qtsx_ThietBi_Id &&
      ListThietBi.filter((d) => d.id === data.tits_qtsx_ThietBi_Id);

    const newData = {
      ...data,
      tits_qtsx_CongDoan_Id: itemData.tram.tits_qtsx_CongDoan_Id,
      maTram: tram[0].maTram,
      tenTram: tram[0].tenTram,
      maThietBi: thietbi && thietbi[0].maThietBi,
      tenThietBi: thietbi && thietbi[0].tenThietBi,
      list_VatTus: listvattu && listvattu,
      list_TramChiTiets: ListThongTinKiemSoat,
    };
    DataThemTram(newData);
    resetFields();
    setListThongTinKiemSoat([]);
    openModalFS(false);
  };

  const DataThemThongTin = (data) => {
    setListThongTinKiemSoat([...ListThongTinKiemSoat, ...data]);
  };

  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Thêm trạm"
      open={openModal}
      width={width > 1200 ? `70%` : `100%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
    >
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <div className="gx-main-content">
          <Form
            {...DEFAULT_FORM_CONGDOAN}
            form={form}
            name="nguoi-dung-control"
            onFinish={onFinish}
            onFieldsChange={() => setFieldTouch(true)}
          >
            <FormItem
              label="Trạm"
              name={["themtram", "tits_qtsx_Tram_Id"]}
              rules={[
                {
                  type: "string",
                  required: true,
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListTram}
                placeholder="Chọn trạm"
                optionsvalue={["id", "tenTram"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Thiết bị"
              name={["themtram", "tits_qtsx_ThietBi_Id"]}
              rules={[
                {
                  type: "string",
                },
              ]}
            >
              <Select
                className="heading-select slt-search th-select-heading"
                data={ListThietBi}
                placeholder="Chọn thiết bị"
                optionsvalue={["id", "tenThietBi"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
                allowClear
              />
            </FormItem>
            <FormItem
              label="Vật tư"
              name={["themtram", "list_VatTus"]}
              rules={[
                {
                  type: "array",
                },
              ]}
            >
              <Select
                mode="multiple"
                className="heading-select slt-search th-select-heading"
                data={ListVatTu}
                placeholder="Chọn vật tư"
                optionsvalue={["tits_qtsx_VatTu_Id", "tenVatTu"]}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="name"
              />
            </FormItem>
            <FormItem
              label="Thứ tự"
              name={["themtram", "thuTu"]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input className="input-item" placeholder="Thứ tự" />
            </FormItem>
            <Card
              className="th-card-margin-bottom th-card-reset-margin"
              title={"Thông tin kiểm soát"}
              headStyle={{
                textAlign: "center",
                backgroundColor: "#0469B9",
                color: "#fff",
              }}
            >
              <div align={"end"}>
                <Button
                  icon={<PlusCircleOutlined />}
                  onClick={() => setActiveModalThongTin(true)}
                  type="primary"
                >
                  Thêm thông tin kiểm soát
                </Button>
              </div>

              <Table
                bordered
                columns={columns}
                scroll={{ x: 1000, y: "55vh" }}
                components={components}
                className="gx-table-responsive"
                dataSource={ListThongTinKiemSoat}
                size="small"
                rowClassName={"editable-row"}
                pagination={false}
                // loading={loading}
              />
            </Card>
            <Row justify={"center"}>
              <Button
                type="primary"
                htmlType={"submit"}
                disabled={!fieldTouch && ListThongTinKiemSoat.length === 0}
              >
                Thêm trạm
              </Button>
            </Row>
          </Form>
          <ModalThongTinKiemSoat
            openModal={ActiveModalThongTin}
            openModalFS={setActiveModalThongTin}
            itemData={ListThongTinKiemSoat}
            DataThemThongTin={DataThemThongTin}
          />
        </div>
      </Card>
    </AntModal>
  );
}

export default ModalTram;
