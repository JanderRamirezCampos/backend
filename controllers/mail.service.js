import nodemailer from 'nodemailer';

const enviarCorreoAceptado = async (req) => {

    console.log('BODY QUE LLEGA DEL MODAL DE: ', req.body);
    if (req.body.notaenvio != "" && req.body.remitente != "" && req.body.correo != "") {
        const transport = nodemailer.createTransport({
            //service:'gmail.com',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                /* user: 'example@gmail.com',
                pass: 'contra aplicacion de gmail', */
                user: "jajoramirezca@gmail.com",
                pass: "ixxdpgodplgorttv",
            },
            tls: {
                rejectUnauthorized: false
            },
        });

        const cuerpoCorreo = `
        <html>
          <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Información de Contacto</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            background-color: #ffffff;
            border: 1px solid #dcdcdc;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            max-width: 600px;
            width: 100%;
        }

        .container h4 {
            color: #ab2a3e;
            margin-bottom: 20px;
            text-align: center;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        table td {
            padding: 12px;
            border: 1px solid #dcdcdc;
            vertical-align: top;
        }

        table td:first-child {
            font-weight: bold;
            background-color: #f4f4f4;
            color: #333;
        }

        table td:last-child {
            background-color: #ffffff;
            color: #555;
        }

        a {
            color: #007bff;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #888;
        }
    </style>
</head>

<body>
    <div class="container">
        <h4>Información de Contacto para Utilizar Expedientes</h4>
        <table>
            <tbody>
                <tr>
                    <td>Tu usuario es:</td>
                    <td>${req.body.user}</td>
                </tr>
                <tr>
                    <td>Contraseña:</td>
                    <td>${req.body.pass}</td>
                </tr>
                <tr>
                    <td>Observaciones:</td>
                    <td>Por favor, gurdar estos datos de forma segura.</td>
                </tr>
                <tr>
                    <td>Recomendaciones:</td>
                    <td>
                        Cualquier duda remitir pregunta al correo: 
                        <b>jajoramirezca@gmail.com</b><br>
                        Consulte su trámite 
                        <a href="https://epgunprg.edu.pe/">aquí</a>.
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="footer">
            <p>Este mensaje fue generado automáticamente al registrarte. Por favor, no responda a este correo.</p>
        </div>
    </div>
</body>
</html> `;


        const fromCorreo = req.body.correo;
        const mailOpciones = {
            from: ["jajoramirezca@gmail.com"],
            to: [fromCorreo],
            subject: "Se ha registrado correctamente",
            /*  text:req.body.nombres + req.body.enlace,   */
            html: cuerpoCorreo,
        };
        transport.verify().then().catch(console.error);
        transport.sendMail(mailOpciones, function (error, result) {
            /*       fs.unlink(req.file.path, (err) => {
                    console.log("fromCorreo: ", fromCorreo);
                    if (err)  return err;
            
                  }); */
            if (error) return error;
        });

        //cerramos el  transporte
        //console.log("Correo enviado correctamente");
        transport.close();
        return "Correo enviado correctamente"; // Retornar mensaje de éxito o error
    }
};
export default enviarCorreoAceptado;
