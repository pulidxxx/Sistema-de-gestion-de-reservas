import React, { useEffect, useState } from "react";
import { Col, Card, Badge, Container, Row } from "react-bootstrap";

const Externo: React.FC = () => {
  const [mensaje, setMensaje] = useState("");

  const username= "20212020035";
  const password= "gyuheejo";
  const handleLogin = async () => {
    try {
      const response = await fetch(
        "https://backendseminario-7czj.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      console.log("Response data:", data);
      if (data.success === false) {
        throw new Error("Esperando...");
      }
      localStorage.setItem("token", data.data.token);

      setMensaje("✅ Busqueda exitosa.");
      console.log("Token:  ", data.data.token);
    } catch (error) {
      setMensaje(
        `❌ Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const [recursos, setRecursos] = useState<any>([]);
  const [recursosObtenidos, setRecursosObtenidos] = useState(false);
  const fetchRecursos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://backendseminario-7czj.onrender.com/api/resources/available",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        obtenerRecursos();
        throw new Error("Error al obtener los recursos");
      }

      const json = await response.json();
      console.log(json);

      if (json.success) {
        setRecursos(json.data);
        setRecursosObtenidos(true);
        setMensaje("✅ Recursos obtenidos exitosamente.");
      } else {
        console.error("Respuesta fallida:", json);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  function sleep(ms:any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const obtenerRecursos = async () => {
    await sleep(5000);
    await handleLogin();
    await fetchRecursos();
  };
  useEffect(() => {
    const ejecutar = async () => {
      if (!localStorage.getItem("token")) await handleLogin();
      await fetchRecursos();
    };

    ejecutar();
  }, []);

  return (
    <div style={{ maxWidth: "100%", padding: "40px 40px", minHeight: "70vh" }}>
      <h1 className="text-center">Recuersos externos</h1>
      {mensaje && (
        <div
          style={{
            display: "block",
            margin: "20px auto 0",
            boxShadow: "0 0 12px rgba(66, 185, 26, 0.73) ",
            padding: "10px",
            width: "50%",
            background: mensaje.startsWith("✅") ? "#d4edda" : "#f8d7da",
            color: mensaje.startsWith("✅") ? "#155724" : "#721c24",
            border: "1px solid",
            borderColor: mensaje.startsWith("✅") ? "#c3e6cb" : "#f5c6cb",
            borderRadius: "4px",
          }}
        >
          {mensaje}
        </div>
      )}
      {recursosObtenidos && (
        <div style={{margin: "30px 0", maxWidth: "100%" }}>
          <h3 style={{marginBottom:"30px", textIndent:"7px"}}>Recursos Disponibles</h3>
          <div style={{ maxWidth: "90%", display:"block", margin: "auto" }}>
            <Row className="g-4">
              {recursos.map((recurso: any) => (
                <Col
                  key={recurso.id}
                  xs={6}
                  sm={6}
                  md={6}
                  lg={4}
                  xl={3}
                  className="d-flex justify-Content-around"
                >
                  <Card
                    style={{
                      width: "18rem",
                    }}
                    className={`custom-card ${!true ? "opacity-75" : ""}`}
                  >
                    <Card.Header className="text-center">
                      {recurso.name}
                    </Card.Header>
                    <Card.Body>
                      <Card.Text>
                        Tipo: {recurso.typeName}
                        <br />
                        Unidad de servicio: {recurso.serviceUnitName}
                        <br />
                        Estado: {recurso.status}
                        <br />
                        Cantidad: {recurso.availableQuantity}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}
    </div>
  );
};

export default Externo;
