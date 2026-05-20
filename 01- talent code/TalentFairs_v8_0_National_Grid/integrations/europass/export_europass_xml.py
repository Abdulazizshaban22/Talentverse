from xml.etree.ElementTree import Element, SubElement, tostring
def export_cv(person):
    root = Element('EuropassCV')
    ident = SubElement(root, 'Identification')
    SubElement(ident, 'PersonName').text = person.get('fullName','')
    return tostring(root, encoding='utf-8')
