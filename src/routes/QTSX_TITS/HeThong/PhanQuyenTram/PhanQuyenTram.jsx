import { SaveOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button } from "antd";
import { useDispatch } from "react-redux";
import { Select, Tree } from "src/components/Common";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
function PhanQuyenTram({ permission, history }) {
  const dispatch = useDispatch();
  const [UserSelect, setUserSelect] = useState();
  const [disableTree, setDisableTree] = useState(false);
  const [treeData, setTreeData] = useState();
  const [donViRole, setDonViRole] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [user, setUser] = useState("");
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };

  useEffect(() => {
    if (permission && permission.view) {
      getUser(INFO);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUser = (info) => {
    let param = convertObjectToUrlParams({ donviId: info.donVi_Id, key: 1 });

    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `Account/get-cbnv?${param}`,
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
        setUserSelect(
          res.data.map((d) => {
            return {
              name: `${d.maNhanVien} - ${d.fullName}${
                d.email ? " - " + d.email : ""
              }`,
              ...d,
            };
          })
        );
      } else {
        setUserSelect([]);
      }
    });
  };
  /**
   * Load danh sách người dùng
   * @param keyword Từ khóa
   * @param page Trang
   * @param pageSize
   */
  const getListData = (id) => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Mobile/get-list-tram-tree`,
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
        setTreeData(res.data);
      }
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Mobile/get-list-phan-quyen-tram-nguoi-dung-web?nguoiDung_Id=${id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data.length > 0) {
        const expandedkey = [];
        const tram = [];
        res.data.forEach((q) => {
          expandedkey.push(q.tits_qtsx_Xuong_Id, q.tits_qtsx_Chuyen_Id);
          tram.push(q.tits_qtsx_Tram_Id);
        });
        setExpandedKeys(expandedkey);
        setDonViRole(tram);
      } else {
        setDonViRole(null);
      }
    });
  };
  const hanldeSelectTaiKhoan = (val) => {
    setDisableTree(true);
    setUser(val);
    getListData(val);
  };

  const onCheck = (checkedKeysValue) => {
    setDonViRole(checkedKeysValue);
  };
  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
  };

  const handleSave = () => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_Mobile/post-phan-quyen-tram-nguoi-dung`,
          "POST",
          {
            nguoiDung_Id: user,
            list_Trams: donViRole.map((k) => {
              return {
                tits_qtsx_Tram_Id: k,
              };
            }),
          },
          "ADD",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        getListData(user);
      })
      .catch((err) => console.log(err));
  };

  const addButtonRender = () => {
    return (
      <>
        <Button
          icon={<SaveOutlined />}
          className="th-btn-margin-bottom-0"
          type="primary"
          onClick={handleSave}
          disabled={
            (permission && !permission.add) || user === "" || !donViRole
          }
        >
          Lưu
        </Button>
      </>
    );
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Phân quyền Trạm"
        description="Phân quyền Trạm"
        buttons={addButtonRender()}
      />
      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row>
          <Col
            xxl={2}
            xl={3}
            lg={4}
            md={4}
            sm={5}
            xs={7}
            align={"center"}
            style={{ marginTop: 8 }}
          >
            <h5>Tài khoản: </h5>
          </Col>
          <Col
            xxl={19}
            xl={19}
            lg={19}
            md={19}
            sm={19}
            xs={16}
            style={{ marginBottom: 8 }}
          >
            <Select
              className="heading-select slt-search th-select-heading"
              data={UserSelect ? UserSelect : []}
              placeholder="Tìm tài khoản"
              optionsvalue={["id", "name"]}
              style={{ width: "100%" }}
              optionFilterProp={"name"}
              showSearch
              onSelect={hanldeSelectTaiKhoan}
            />
          </Col>
        </Row>
      </Card>
      {disableTree && (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Tree
            checkable
            height={"60vh"}
            treeData={treeData}
            options={["id", "name", "children"]}
            onCheck={onCheck}
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            checkedKeys={donViRole}
            selectable={false}
          />
        </Card>
      )}
    </div>
  );
}
export default PhanQuyenTram;
