# Em um arquivo como core/renderers.py

from rest_framework_csv.renderers import CSVRenderer
from rest_framework.renderers import BaseRenderer
import openpyxl
from io import BytesIO

class XLSXRenderer(BaseRenderer):
    media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    format = 'xlsx'
    charset = None
    render_style = 'binary'

    def render(self, data, media_type=None, renderer_context=None):
        if not isinstance(data, list):
            data = [data]

        workbook = openpyxl.Workbook()
        worksheet = workbook.active

        if data:
            # Pega os cabeçalhos do primeiro item
            headers = list(data[0].keys())
            worksheet.append(headers)

            # Adiciona as linhas de dados
            for item in data:
                row = [item.get(header, '') for header in headers]
                worksheet.append(row)

        # Salva o workbook em um buffer de memória
        buffer = BytesIO()
        workbook.save(buffer)
        buffer.seek(0)
        return buffer.read()

# Renderizador CSV customizado para lidar com nomes de arquivo
class CustomCSVRenderer(CSVRenderer):
    def render(self, data, media_type=None, renderer_context=None):
        response = renderer_context['response']
        filename = response.get('Content-Disposition', 'attachment; filename="export.csv"').split('filename=')[1].strip('"')
        
        # Define o nome do arquivo no header
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return super().render(data, media_type, renderer_context)
