import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Card, Row, Col, DatePicker, Form, Input, Button } from "antd";

import map from "lodash/map";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "src/components/Common";
import { getNumberDayOfMonth } from "src/util/Common";
import { fetchReset, fetchStart } from "src/appRedux/actions/Common";
import { reDataForTable } from "src/util/Common";

import { ModalDeleteConfirm, Table } from "src/components/Common";
import ContainerHeader from "src/components/ContainerHeader";

import { convertObjectToUrlParams } from "src/util/Common";
import moment from "moment";

const validateNumber = (_, value) => {
  if (!Number.isNaN(parseFloat(value))) {
    return Promise.resolve();
  }
  return Promise.reject("Vui lòng nhập số hợp lệ");
};

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[{ validator: validateNumber }]}
      >
        <Input
          style={{
            margin: 0,
            width: "100%",
          }}
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          border: "none",
        }}
        align={"center"}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
function KeHoach({ match, history, permission }) {
  const dispatch = useDispatch();
  const { data, loading, width } = useSelector(({ common }) => common).toJS();
  const [keHoachSelect, setKeHoachSelect] = useState([
    { id: "khsx", keHoach: "Kế hoạch sản xuất" },
    { id: "khgh", keHoach: "Kế hoạch giao hàng" },
  ]);
  const [keHoach, setKeHoach] = useState("khsx");
  const [ListXuong, setListXuong] = useState([]);
  const [VersionSelect, setVersionSelect] = useState([]);

  const [thang, setThang] = useState(
    (new Date().getMonth() + 1).toString().length == 1
      ? "0" + (new Date().getMonth() + 1).toString()
      : (new Date().getMonth() + 1).toString()
  );
  const [nam, setNam] = useState(new Date().getFullYear());
  const [loaiXe, setLoaiXe] = useState("");
  const [Version, setVersion] = useState("");

  useEffect(() => {
    if (permission && permission.view) {
      // getLoaiXe();
      // getVersion(keHoach, thang, nam);
      // getListData(keHoach, loaiXe, thang, nam);
    } else if (permission && !permission.view) {
      history.push("/home");
    }
    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /**
   * Load danh sách người dùng
   * @param kehoach Từ khóa
   * @param loaixe_id loại xe id
   * @param thangnam tháng năm
   */
  const getListData = (loai_kh, loaixe_id, thang, nam, lsid) => {
    let param = convertObjectToUrlParams({
      thang,
      nam,
      loaixe_id,
      loai_kh,
      lsid,
    });
    dispatch(fetchStart(`Xe/xem-ke-hoach?${param}`, "GET", null, "LIST"));
  };
  const getLoaiXe = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(`LoaiXe`, "GET", null, "DETAIL", "", resolve, reject)
      );
    })
      .then((res) => {
        if (res && res.data) {
          // setListXuong(res.data);
        }
      })
      .catch((error) => console.error(error));
  };
  const getVersion = (kh, t, n) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Xe/xem-lichsu-kh?loai_kh=${kh}&thang=${t}&nam=${n}`,
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
          // setVersionSelect(res.data);
        } else {
          // setVersionSelect([]);
        }
      })
      .catch((error) => console.error(error));
  };

  /**
   * Save item from table
   * @param {object} row
   * @memberof ChucNang
   */
  const handleSave = async (row) => {
    for (let i = 1; i <= getNumberDayOfMonth(); i++) {
      if (typeof row[i] == "string") {
        new Promise((resolve, reject) => {
          dispatch(
            fetchStart(
              `Xe/sua-ke-hoach/${keHoach}`,
              "POST",
              {
                ngay: i,
                thang: row.thang,
                nam: row.nam,
                xe_Id: row.xe_id,
                soLuong: Number(row[i]),
              },
              "EDIT",
              "",
              resolve,
              reject
            )
          );
        })
          .then((res) => {
            if (res && res.status === 200) {
              getListData(keHoach, loaiXe, thang, nam);
            }
          })
          .catch((error) => console.error(error));
      }
    }
  };
  /**
   * deleteItemFunc: Remove item from list
   * @param {object} item
   * @returns
   * @memberof VaiTro
   */
  const deleteItemFunc = (item) => {
    ModalDeleteConfirm(deleteItemAction, item);
  };

  /**
   * Remove item
   *
   * @param {*} item
   */
  const deleteItemAction = (item) => {
    const loaikh = keHoach;
    const xe_id = item.xe_id;
    let param = convertObjectToUrlParams({ loaikh, thang, nam, xe_id });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Xe/xoa-ke-hoach?${param}`,
          "POST",
          "",
          "EDIT",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.status === 200) {
          getListData(keHoach, loaiXe, thang, nam);
        }
      })
      .catch((error) => console.error(error));
  };
  /**
   * ActionContent: Action in table
   * @param {*} item
   * @returns View
   * @memberof ChucNang
   */
  const actionContent = (item) => {
    const deleteItemVal =
      permission.del && !item.isUsed
        ? { onClick: () => deleteItemFunc(item) }
        : { disabled: true };
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
  const column = new Array(getNumberDayOfMonth(thang, nam))
    .fill(null)
    .map((_, i) => {
      const id = String(i + 1);
      return {
        title: id,
        width: width > 450 ? 50 : 55,
        align: "center",
        dataIndex: id,
        key: "key",
      };
    });
  let colValues = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 50,
      align: "center",
      fixed: width > 550 ? "left" : "none",
    },

    {
      title: "Mã sản phẩm",
      dataIndex: "maxe",
      key: "maxe",
      align: "center",
      width: 120,
      fixed: width > 550 ? "left" : "none",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "tenxe",
      key: "tenxe",
      align: "center",
      width: 120,
      fixed: width > 550 ? "left" : "none",
    },
    ...column,

    {
      title: "Xóa",
      key: "action",
      align: "center",
      width: 50,
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
        handleSave: handleSave,
      }),
    };
  });
  const handleOnSelectKeHoach = (value) => {
    setVersion(null);
    getListData(value, loaiXe, thang, nam);
    getVersion(value, thang, nam);
  };
  const handleOnSelectLoaiXe = (value) => {
    getListData(keHoach, value, thang, nam, Version);
  };
  const handleOnSelectVersion = (value) => {
    getListData(keHoach, loaiXe, thang, nam, value);
  };
  const handleOnChangeDate = (dateString) => {
    const thang = dateString.slice(0, 2);
    const nam = dateString.slice(-4);
    setThang(thang);
    setNam(nam);
    setVersion(null);
    getListData(keHoach, loaiXe, thang, nam);
    getVersion(keHoach, thang, nam);
  };
  const { totalPages, totalRow } = data;
  map(data, (data) => {
    map(data.chiTietKH, (d) => {
      const key = d.ngay;
      data[key] = d.soLuong;
    });
  });

  for (let i = 1; i <= getNumberDayOfMonth(); i++) {
    map(data, (d) => {
      if (d[i] == undefined || d[i] == 0) {
        d[i] = "-";
      }
    });
  }

  const handleClearLoaiXe = (value) => {
    getListData(keHoach, "", thang, nam);
    setLoaiXe(null);
  };
  const handleClearVersion = (value) => {
    getListData(keHoach, loaiXe, thang, nam);
    setVersion(null);
  };
  const handleImport = () => {
    history.push(`${match.url}/import`);
  };
  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<UploadOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleImport}
          disabled={permission && !permission.add}
        >
          Import
        </Button>
      </>
    );
  };

  const dataList = reDataForTable(data);
  return (
    <div className="gx-main-content">
      <ContainerHeader
        title={"Kế hoạch"}
        description="Kế hoạch"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={6}
            xl={8}
            lg={8}
            md={8}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Kế hoạch:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={keHoachSelect ? keHoachSelect : []}
              placeholder="Chọn kế hoạch"
              optionsvalue={["id", "keHoach"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectKeHoach}
              onChange={(value) => setKeHoach(value)}
              value={keHoach}
            />
          </Col>

          <Col
            xxl={6}
            xl={8}
            lg={8}
            md={8}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Xưởng sản xuất:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={ListXuong ? ListXuong : []}
              placeholder="Chọn xưởng"
              optionsvalue={["id", "tenLoaiXe"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectLoaiXe}
              onChange={(value) => setLoaiXe(value)}
              value={loaiXe}
              allowClear
              onClear={handleClearLoaiXe}
            />
          </Col>
          <Col
            xxl={6}
            xl={8}
            lg={8}
            md={8}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Tháng:</h5>
            <DatePicker
              allowClear={false}
              format={"MM/YYYY"}
              style={{ width: "100%" }}
              placeholder="Chọn tháng"
              picker="month"
              value={moment(thang + "/" + nam, "MM/YYYY")}
              onChange={(date, dateString) => handleOnChangeDate(dateString)}
            />
          </Col>

          <Col
            xxl={6}
            xl={8}
            lg={8}
            md={8}
            sm={24}
            xs={24}
            style={{ marginBottom: 8 }}
          >
            <h5>Version:</h5>
            <Select
              className="heading-select slt-search th-select-heading"
              data={VersionSelect ? VersionSelect : []}
              placeholder={"Version hiện hành"}
              optionsvalue={["id", "tenVersion"]}
              style={{ width: "100%" }}
              onSelect={handleOnSelectVersion}
              onChange={(value) => setVersion(value)}
              value={Version}
              allowClear
              onClear={handleClearVersion}
            />
          </Col>
        </Row>
        <Table
          style={{ marginTop: 10 }}
          bordered
          scroll={{ x: 1500 }}
          columns={columns}
          components={components}
          className="gx-table-responsive"
          dataSource={dataList}
          size="small"
          rowClassName={"editable-row"}
          pagination={{
            total: totalRow,
            showSizeChanger: false,
            showQuickJumper: true,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
}

export default KeHoach;
