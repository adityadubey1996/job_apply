import yaml
import subprocess
import os
from datetime import datetime

class ResumeGenerator:
    def __init__(self, yaml_file, output_filename="Custom_Resume", output_folder="generated_resumes"):
        self.yaml_file = yaml_file
        self.output_filename = output_filename
        self.output_folder = output_folder
        self.data = self.read_yaml()

    def read_yaml(self):
        """Reads the YAML file and returns the parsed data."""
        with open(self.yaml_file, 'r') as file:
            return yaml.safe_load(file)

    def create_latex_cv(self):
        """Generates the LaTeX content for the resume based on the YAML data."""
        data = self.data
        latex_content = r'''
\documentclass[11pt,a4paper,sans]{moderncv}
\moderncvstyle{banking}
\moderncvcolor{blue}
\usepackage[colorlinks=true, linkcolor=blue, pdfpagelabels=false]{hyperref}
\usepackage[scale=0.8]{geometry}
\usepackage[utf8]{inputenc}
\name{''' + data['personal_information'].get('name', '') + r'''}{''' + data['personal_information'].get('surname', '') + r'''}
\title{Experienced Professional in Software Engineering}
\address{''' + data['personal_information'].get('address', '') + r'''}{''' + data['personal_information'].get('city', '') + r'''}{''' + data['personal_information'].get('country', '') + r'''}
\phone[mobile]{''' + data['personal_information'].get('phone_prefix', '') + data['personal_information'].get('phone', '') + r'''}
\email{''' + data['personal_information'].get('email', '') + r'''}
\social[linkedin]{''' + data['personal_information'].get('linkedin', '') + r'''}
\social[github]{''' + data['personal_information'].get('github', '') + r'''}

\begin{document}
\makecvtitle

\section{Professional Summary}
''' + data.get('professional_summary', {}).get('summary', 'Summary not provided.') + r'''

\section{Skills}
\cvitem{}{\begin{itemize}'''
        for skill in data.get('skills', []):
            latex_content += r'\item ' + skill + '\n'
        latex_content += r'''\end{itemize}}

\section{Education}
    '''
        for edu in data.get('education_details', []):
            latex_content += r'\cventry{' + edu.get('graduation_year', '') + r'}{' + edu.get('degree', '') + r'}{' + edu.get('university', '') + r'}{' + edu.get('field_of_study', '') + r'}{}{}'

        latex_content += r'''
\section{Experience}
    '''
        for job in data.get('experience_details', []):
            latex_content += r'\cventry{' + job.get('employment_period', '') + r'}{' + job.get('position', '') + r'}{' + job.get('company', '') + r'}{' + job.get('location', '') + r'}{}{' + '\n'
            latex_content += r'\begin{itemize}'
            for responsibility in job.get('key_responsibilities', []):
                latex_content += r'\item ' + responsibility + '\n'
            latex_content += r'\end{itemize}}'

        latex_content += r'''
\section{Projects}
    '''
        for project in data.get('projects', []):
            latex_content += r'\cvitem{' + project.get('name', '') + r'}{\href{' + project.get('link', '') + r'}{' + project.get('description', '') + r'}}'

        latex_content += r'''
\section{Certifications}
    '''
        for cert in data.get('certifications', []):
            latex_content += r'\cvitem{}{' + cert + '}'

        latex_content += r'''
\section{Achievements}
    '''
        for achievement in data.get('achievements', []):
            latex_content += r'\cvitem{' + achievement.get('name', '') + r'}{' + achievement.get('description', '') + '}'

        latex_content += r'''
\section{Languages}
\cvitem{}{\begin{itemize}'''
        for lang in data.get('languages', []):
            latex_content += r'\item ' + lang.get('language', '') + ': ' + lang.get('proficiency', '') + '\n'
        latex_content += r'''\end{itemize}}

\end{document}
    '''
        return latex_content
#         data = self.data
#         print(f"data inside create_latex_cv {data}")
        
#         latex_content = r'''
# \documentclass[11pt,a4paper,sans]{moderncv}
# \moderncvstyle{banking}
# \moderncvcolor{blue}
# \usepackage[colorlinks=true, linkcolor=blue, pdfpagelabels=false]{hyperref}
# \usepackage[scale=0.8]{geometry}
# \usepackage[utf8]{inputenc}
# \name{''' + data['personal_information']['name'] + r'''}{''' + data['personal_information']['surname'] + r'''}
# \title{Experienced Professional in Software Engineering}
# \address{''' + data['personal_information']['address'] + r'''}{''' + data['personal_information']['city'] + r'''}{''' + data['personal_information']['country'] + r'''}
# \phone[mobile]{''' + data['personal_information']['phone_prefix'] + data['personal_information']['phone'] + r'''}
# \email{''' + data['personal_information']['email'] + r'''}
# \social[linkedin]{''' + data['personal_information']['linkedin'] + r'''}
# \social[github]{''' + data['personal_information']['github'] + r'''}

# \begin{document}
# \makecvtitle

# \section{Professional Summary}
# ''' + data.get('professional_summary', 'Dedicated and skilled software engineer with expertise in full-stack development, agile methodologies, and scalable software solutions. Proven track record in delivering high-quality projects on time, leading teams, and optimizing systems for performance and maintainability.') + r'''

# \section{Skills}
# \cvitem{}{\begin{itemize}'''
#         for skill in data['skills']:
#             latex_content += r'\item ' + skill + '\n'
#         latex_content += r'''\end{itemize}}

# \section{Education}
#     '''
#         for edu in data['education_details']:
#             latex_content += r'\cventry{' + edu['graduation_year'] + r'}{' + edu['degree'] + r'}{' + edu['university'] + r'}{' + edu['field_of_study'] + r'}{}{}'

#         latex_content += r'''
# \section{Experience}
#     '''
#         for job in data['experience_details']:
#             latex_content += r'\cventry{' + job['employment_period'] + r'}{' + job['position'] + r'}{' + job['company'] + r'}{' + job['location'] + r'}{}{' + '\n'
#             latex_content += r'\begin{itemize}'
#             for responsibility in job['key_responsibilities']:
#                 latex_content += r'\item ' + responsibility + '\n'
#             latex_content += r'\end{itemize}}'

#         latex_content += r'''
# \section{Projects}
#     '''
#         for project in data['projects']:
#             latex_content += r'\cvitem{' + project['name'] + r'}{\href{' + project['link'] + r'}{' + project['description'] + r'}}'

#         latex_content += r'''
# \section{Certifications}
#     '''
#         for cert in data['certifications']:
#             latex_content += r'\cvitem{}{' + cert + '}'

#         latex_content += r'''
# \section{Achievements}
#     '''
#         for achievement in data['achievements']:
#             latex_content += r'\cvitem{' + achievement['name'] + r'}{' + achievement['description'] + '}'

#         latex_content += r'''
# \section{Languages}
# \cvitem{}{\begin{itemize}'''
#         for lang in data['languages']:
#             latex_content += r'\item ' + lang['language'] + ': ' + lang['proficiency'] + '\n'
#         latex_content += r'''\end{itemize}}

# \end{document}
#     '''
#         return latex_content

    def compile_latex(self):
        """Compiles the LaTeX content to a PDF file."""
        latex_code = self.create_latex_cv()
        
        # Ensure the output directory exists
        os.makedirs(self.output_folder, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Set paths for .tex and PDF files
        tex_path = os.path.join(self.output_folder, f"{self.output_filename}_{timestamp}.tex")
        pdf_path = os.path.join(self.output_folder, f"{self.output_filename}_{timestamp}.pdf")

        # Write the LaTeX code to a .tex file
        with open(tex_path, "w", encoding="utf-8") as file:
            file.write(latex_code)

        # Run pdflatex to generate the PDF, suppressing output
        with open(os.devnull, 'w') as devnull:
            try:
                subprocess.run(
                    ["pdflatex","-interaction=nonstopmode", "-output-directory", self.output_folder, tex_path],
                    stdout=devnull, stderr=devnull, check=True
                )
                print(f"PDF generated successfully: {pdf_path}")
            except subprocess.CalledProcessError as e:
                print("Failed to compile LaTeX document:", e)


    